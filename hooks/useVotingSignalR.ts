'use client'

import { useEffect, useRef, useCallback } from 'react'
import { API_URL } from '@/constants'
import { useSignalRConnection } from './useSignalRConnection'

interface VotoRegistradoData {
    votacionId: string
    usuarioId?: string // GUID de BD (camelCase)
    UsuarioId?: string // GUID de BD (PascalCase - como el backend lo envía)
    usuarioNombre?: string
    usuarioFoto?: string
    usuarioFirebaseUid?: string // Firebase UID del usuario que votó (camelCase)
    UsuarioFirebaseUid?: string // Firebase UID del usuario que votó (PascalCase)
    restauranteId?: string
    restauranteNombre?: string
    restauranteImagen?: string
    esActualizacion?: boolean
}

interface UseVotingSignalROptions {
    grupoId: string
    currentUserId?: string // Firebase UID del usuario actual para comparar con iniciadoPor
    onResultadosActualizados: (votacionId: string) => Promise<void>
    onVotacionIniciada?: () => Promise<boolean> // Para recargar la votación activa completa, retorna true si encontró votación
    onVotoRegistrado?: (data: VotoRegistradoData) => void // Callback opcional para mostrar toast cuando alguien vota
}

export function useVotingSignalR({ grupoId, currentUserId, onResultadosActualizados, onVotacionIniciada, onVotoRegistrado }: UseVotingSignalROptions) {
    
    // 🔥 Prevenir loops infinitos y spam de eventos
    const lastUpdateRef = useRef<number>(0)
    const isFetchingRef = useRef<boolean>(false)
    const isFetchingVotacionActivaRef = useRef<boolean>(false) // Ref separado para votación activa
    const lastVotacionIdRef = useRef<string | null>(null)

    // Función para cargar resultados cuando llega un evento (con debounce y protección)
    const loadResultados = useCallback(
        async (votacionId: string) => {
            const now = Date.now()
            
            // 1. Debounce: ignorar eventos duplicados en menos de 500ms
            if (now - lastUpdateRef.current < 500) {
                console.log('[SignalR] Evento ignorado por debounce (< 500ms)')
                return
            }
            
            // 2. Evitar múltiples fetches simultáneos
            if (isFetchingRef.current) {
                console.log('[SignalR] Fetch ya en progreso, ignorando evento')
                return
            }
            
            // 3. Evitar recargar si es el mismo votacionId (a menos que sea un evento nuevo)
            if (lastVotacionIdRef.current === votacionId && now - lastUpdateRef.current < 2000) {
                console.log('[SignalR] Mismo votacionId reciente, ignorando')
                return
            }
            
            lastUpdateRef.current = now
            lastVotacionIdRef.current = votacionId
            isFetchingRef.current = true
            
            try {
                await onResultadosActualizados(votacionId)
            } catch (err) {
                console.error('[useVotingSignalR] Error loading resultados:', err)
            } finally {
                // Permitir nuevo fetch después de un pequeño delay
                setTimeout(() => {
                    isFetchingRef.current = false
                }, 300)
            }
        },
        [onResultadosActualizados]
    )
    
    // Función para recargar votación activa (con debounce)
    const loadVotacionActiva = useCallback(
        async () => {
            const now = Date.now()
            
            // Debounce para evitar spam
            if (now - lastUpdateRef.current < 500) {
                console.log('[SignalR] VotacionIniciada ignorado por debounce')
                return
            }
            
            if (isFetchingRef.current) {
                console.log('[SignalR] Fetch ya en progreso, ignorando VotacionIniciada')
                return
            }
            
            lastUpdateRef.current = now
            isFetchingRef.current = true
            
            try {
                if (onVotacionIniciada) {
                    await onVotacionIniciada()
                }
            } catch (err) {
                console.error('[useVotingSignalR] Error loading votacion activa:', err)
            } finally {
                setTimeout(() => {
                    isFetchingRef.current = false
                }, 300)
            }
        },
        [onVotacionIniciada]
    )

    // URL del hub: el backend mapea a /votacionesHub
    // grupoId se pasa en query string
    const hubUrl = grupoId ? `${API_URL}/votacionesHub?grupoId=${grupoId}` : ''

    // Usar el hook genérico de SignalR (evita múltiples instancias y problemas de estado)
    // No pasamos token porque SignalR envía cookies automáticamente con withCredentials: true
    const { connection, isConnected, error } = useSignalRConnection({
        url: hubUrl,
        // token no es necesario: SignalR envía cookies HttpOnly automáticamente
        withCredentials: true, // Envía cookies automáticamente (HttpOnly)
    })

    // Suscribirse a eventos cuando la conexión esté lista
    useEffect(() => {
        if (!connection || !isConnected) return

        // Suscribirse a eventos (con debounce y protección contra loops)
        connection.on('VotacionIniciada', async (data: { 
            votacionId: string
            grupoId?: string
            descripcion?: string
            fechaInicio?: string
            iniciadoPor?: string // Firebase UID del usuario que inició la votación
        }) => {
                    console.log('[SignalR] VotacionIniciada recibido:', data)
                    
                    // Si el usuario actual es el que inició la votación, ignorar el evento
                    // porque ya recargó la votación activa después de iniciarla
                    if (currentUserId && data.iniciadoPor === currentUserId) {
                        console.log('[SignalR] Votación iniciada por el usuario actual, ignorando evento')
                        return
                    }
                    
                    // Si no es el admin, cargar la votación activa para que vea la nueva votación
                    // 🔥 Para VotacionIniciada, esperar un poco para que el backend termine de guardar
                    // El backend puede tardar unos milisegundos en persistir la votación
                    if (onVotacionIniciada) {
                        // Solo evitar si ya hay un fetch en progreso
                        if (isFetchingVotacionActivaRef.current) {
                            console.log('[SignalR] Ya hay un fetch en progreso, esperando...')
                            return
                        }
                        
                        isFetchingVotacionActivaRef.current = true
                        
                        // 🔥 Hacer múltiples intentos con delays crecientes hasta encontrar la votación
                        // El backend puede tardar en persistir la votación después de emitir SignalR
                        const hacerFetchConRetry = async () => {
                            const delays = [500, 1300, 2300] // 500ms, 1300ms, 2300ms desde el evento
                            
                            for (let i = 0; i < delays.length; i++) {
                                const delay = delays[i]
                                const intento = i + 1
                                
                                await new Promise(resolve => setTimeout(resolve, delay))
                                
                                try {
                                    console.log(`[SignalR] Ejecutando onVotacionIniciada (intento ${intento}, delay ${delay}ms)...`)
                                    const encontrada = await onVotacionIniciada()
                                    
                                    if (encontrada) {
                                        console.log(`[SignalR] ✅ Votación encontrada en intento ${intento}`)
                                        return // Salir si encontramos la votación
                                    } else {
                                        console.log(`[SignalR] ⚠️ Votación no encontrada en intento ${intento}, reintentando...`)
                                        // Continuar al siguiente intento
                                    }
                                } catch (err) {
                                    console.error(`[SignalR] Error en intento ${intento}:`, err)
                                    // Continuar al siguiente intento
                                }
                            }
                            
                            console.log('[SignalR] ⚠️ No se encontró la votación después de todos los intentos')
                        }
                        
                        hacerFetchConRetry().finally(() => {
                            // Permitir nuevo fetch después de que terminen todos los intentos
                            setTimeout(() => {
                                isFetchingVotacionActivaRef.current = false
                            }, 500)
                        })
                    }
                })

        connection.on('VotoRegistrado', (data: VotoRegistradoData) => {
            console.log('[SignalR] VotoRegistrado:', data)
            
            // Si el callback está definido, mostrar toast con la información del voto
            // Nota: El backend envía usuarioId como GUID de BD, no Firebase UID
            // Por ahora mostramos el toast a todos excepto si podemos identificar al usuario actual
            if (onVotoRegistrado) {
                onVotoRegistrado(data)
            }
            
            // Cargar resultados actualizados
            loadResultados(data.votacionId)
        })

        connection.on('ResultadosActualizados', (data: { votacionId: string }) => {
            console.log('[SignalR] ResultadosActualizados:', data)
            loadResultados(data.votacionId)
        })

        connection.on('EmpateDetectado', (data: { votacionId: string }) => {
            console.log('[SignalR] EmpateDetectado:', data)
            loadResultados(data.votacionId)
        })

        connection.on('GanadorSeleccionado', (data: { votacionId: string; restauranteGanadorId?: string }) => {
            console.log('[SignalR] GanadorSeleccionado:', data)
            loadResultados(data.votacionId)
        })

        connection.on('VotacionCerrada', (data: { votacionId: string; restauranteGanadorId?: string }) => {
            console.log('[SignalR] VotacionCerrada:', data)
            // Cuando se cierra la votación, recargar la votación activa completa
            // para verificar si hayVotacionActiva = false y limpiar el estado
            if (onVotacionIniciada) {
                // Reutilizamos el callback de votación iniciada para recargar la activa
                loadVotacionActiva()
            } else {
                // Fallback: cargar resultados
                loadResultados(data.votacionId)
            }
        })

        // Cleanup: desuscribirse de eventos al desmontar o cambiar conexión
        return () => {
            if (connection) {
                connection.off('VotacionIniciada')
                connection.off('VotoRegistrado')
                connection.off('ResultadosActualizados')
                connection.off('EmpateDetectado')
                connection.off('GanadorSeleccionado')
                connection.off('VotacionCerrada')
            }
        }
    }, [connection, isConnected, currentUserId, onVotacionIniciada, onVotoRegistrado, loadResultados, loadVotacionActiva])

    return {
        connection,
        isConnected,
        error,
    }
}

