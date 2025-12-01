'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { VotingPanel, VotingResults } from '@/components/Voting'
import { ResultadoVotacion, VotacionActivaResponse, Restaurant } from '@/types'
import { useVotingSignalR } from '@/hooks/useVotingSignalR'
import styles from './styles.module.css'

interface Props {
    groupId: string
    members: unknown[]
    isAdmin?: boolean
    currentRestaurants: Restaurant[] // Restaurantes visibles en el mapa para usar como candidatos
}

export default function GroupVoting({ groupId, members: _members, isAdmin = false, currentRestaurants = [] }: Props) {
    const auth = useAuth()
    const toast = useToast()
    
    const [resultados, setResultados] = useState<ResultadoVotacion | undefined>(undefined)
    const [soyAdministrador, setSoyAdministrador] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // 🔥 Prevenir múltiples fetches simultáneos
    const isFetchingResultadosRef = useRef(false)
    const lastFetchVotacionIdRef = useRef<string | null>(null)
    const lastFetchTimeRef = useRef<number>(0)

    // Obtener resultados de votación (usado por SignalR y carga inicial)
    const fetchResultados = useCallback(async (votacionId: string) => {
        const now = Date.now()
        
        // Evitar múltiples fetches simultáneos
        if (isFetchingResultadosRef.current) {
            console.log('[GroupVoting] Fetch de resultados ya en progreso, ignorando')
            return
        }
        
        // Debounce: evitar fetches del mismo votacionId muy seguidos
        if (lastFetchVotacionIdRef.current === votacionId && now - lastFetchTimeRef.current < 300) {
            console.log('[GroupVoting] Fetch reciente del mismo votacionId, ignorando')
            return
        }
        
        isFetchingResultadosRef.current = true
        lastFetchVotacionIdRef.current = votacionId
        lastFetchTimeRef.current = now
        
        try {
            const res = await fetch(`/api/votacion/${votacionId}/resultados`)
            
            if (res.ok) {
                const data = await res.json()
                
                // 🔥 Si la votación está cerrada, limpiar el estado directamente
                // No recargar fetchVotacionActiva para evitar loops
                if (data.estado === 'CERRADA') {
                    console.log('[GroupVoting] Votación cerrada detectada en resultados, limpiando estado')
                    setResultados(undefined)
                } else {
                    setResultados(data)
                }
            }
        } catch (err) {
            console.error('[GroupVoting] Error fetching resultados:', err)
        } finally {
            // Permitir nuevo fetch después de un pequeño delay
            setTimeout(() => {
                isFetchingResultadosRef.current = false
            }, 200)
        }
    }, []) // fetchVotacionActiva no se incluye para evitar dependencia circular

    // Obtener votación activa (carga inicial y cuando SignalR notifica)
    // Retorna true si encontró una votación activa, false si no
    const fetchVotacionActiva = useCallback(async (): Promise<boolean> => {
        try {
            console.log('[GroupVoting] fetchVotacionActiva llamado')
            const res = await fetch(`/api/votacion/grupo/${groupId}/activa`)
            
            if (res.ok) {
                const data: VotacionActivaResponse = await res.json()
                console.log('[GroupVoting] Respuesta votación activa:', { 
                    hayVotacionActiva: data.hayVotacionActiva, 
                    tieneVotacion: !!data.votacion,
                    estado: data.votacion?.estado 
                })
                
                // El backend siempre devuelve 200 OK con esta estructura:
                // { hayVotacionActiva: boolean, soyAdministrador: boolean, votacion: ResultadoVotacion | null }
                setSoyAdministrador(data.soyAdministrador)
                
                if (data.hayVotacionActiva && data.votacion) {
                    // Hay votación activa
                    // Verificar que no esté cerrada (el backend puede devolver votaciones cerradas como "activas" temporalmente)
                    if (data.votacion.estado === 'CERRADA') {
                        // Si está cerrada, limpiar el estado
                        console.log('[GroupVoting] Votación cerrada detectada, limpiando estado')
                        setResultados(undefined)
                        return false
                    } else {
                        console.log('[GroupVoting] Estableciendo votación activa en resultados')
                        setResultados(data.votacion)
                        
                        // Si hay votación activa, obtener resultados completos (por si acaso)
                        const votacionId = data.votacion.votacionId
                        if (votacionId) {
                            await fetchResultados(votacionId)
                        }
                        return true // Votación encontrada
                    }
                } else {
                    // No hay votación activa
                    console.log('[GroupVoting] No hay votación activa, limpiando resultados')
                    setResultados(undefined)
                    return false // No hay votación
                }
            } else {
                // Error del servidor
                console.error('[GroupVoting] Error del servidor al obtener votación activa:', res.status)
                setResultados(undefined)
                setError('Error al cargar la votación')
                return false
            }
        } catch (err) {
            console.error('[GroupVoting] Error fetching votacion activa:', err)
            setError('Error al cargar la votación')
            setResultados(undefined)
            return false
        } finally {
            setLoading(false)
        }
    }, [groupId, fetchResultados])

    // Conectar SignalR
    const { isConnected, error: signalRError, connection } = useVotingSignalR({
        grupoId: groupId,
        onResultadosActualizados: fetchResultados,
        onVotacionIniciada: fetchVotacionActiva, // Recargar votación activa cuando se inicia
    })

    // 🔥 Notificar cuando el usuario se conecta/desconecta del hub de votaciones
    // Esto permite que el componente Social sepa que el usuario está conectado
    // incluso si no está conectado al hub de chat
    useEffect(() => {
        if (!auth.user?.uid) return

        const notifyConnectionStatus = (conectado: boolean) => {
            if (typeof window !== 'undefined' && auth.user?.uid) {
                console.log('[GroupVoting] Emitiendo evento usuario:votaciones:conectado:', {
                    usuarioId: auth.user.uid,
                    conectado,
                    isConnected
                })
                window.dispatchEvent(
                    new CustomEvent('usuario:votaciones:conectado', { 
                        detail: { 
                            usuarioId: auth.user.uid,
                            conectado 
                        } 
                    })
                )
            }
        }

        // Notificar estado actual cuando cambia isConnected
        // También notificar inmediatamente si ya está conectado al montar
        notifyConnectionStatus(isConnected)
    }, [isConnected, auth.user?.uid])

    // Cerrar votación
    const handleCerrarVotacion = useCallback(async (restauranteGanadorId?: string) => {
        const votacionId = resultados?.votacionId
        if (!votacionId) {
            console.error('[GroupVoting] No votacion ID available for close')
            return
        }

        try {
            const res = await fetch(`/api/votacion/${votacionId}/cerrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ restauranteGanadorId }),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.message || 'Error al cerrar votación')
            }

            toast.success('Votación cerrada')
            // SignalR avisará cuando se cierre, no hace falta recargar manualmente
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error desconocido'
            toast.error(message)
        }
    }, [resultados?.votacionId, toast])

    // Carga inicial
    useEffect(() => {
        fetchVotacionActiva()
    }, [fetchVotacionActiva])

    // ❌ NO mostrar errores de SignalR en la UI
    // Los errores de negociación/conexión son temporales y se resuelven automáticamente
    // Solo mantenerlos en consola para debugging
    useEffect(() => {
        if (signalRError) {
            // Solo loggear en consola, NO mostrar en UI
            // Filtrar errores de negociación/conexión que son temporales
            const esErrorTemporal = 
                signalRError.toLowerCase().includes('negotiation') ||
                signalRError.toLowerCase().includes('connection was stopped') ||
                signalRError.toLowerCase().includes('failed to start')
            
            if (esErrorTemporal) {
                console.log('[SignalR] Error temporal (ignorado en UI):', signalRError)
                // NO hacer setError() - estos errores se resuelven automáticamente
            } else {
                // Solo errores críticos (ej: 401 Unauthorized) se muestran
                console.log('[SignalR] Error crítico:', signalRError)
                // Tampoco mostrar en UI para evitar confusión
            }
        }
    }, [signalRError])

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Cargando...</div>
            </div>
        )
    }

    // ❌ NO mostrar errores de conexión/negociación en la UI
    // Estos errores son temporales y se resuelven automáticamente
    // if (error && !resultados) {
    //     return (
    //         <div className={styles.container}>
    //             <div className={styles.error}>{error}</div>
    //         </div>
    //     )
    // }

    // Si no hay votación activa, mostrar botón para iniciar
    if (!resultados) {
        return (
            <div className={styles.container}>
                <h2 className={styles.title}>Votación de Restaurantes</h2>
                <VotingPanel
                    grupoId={groupId}
                    restaurantesCandidatos={[]}
                    votacionActual={undefined}
                    onVotar={async () => {
                        // Después de iniciar, recargar
                        await fetchVotacionActiva()
                    }}
                    soyAdministrador={soyAdministrador || isAdmin}
                    restaurantesDelMapa={currentRestaurants}
                />
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Votación de Restaurantes</h2>
            
            {/* ❌ NO mostrar errores de conexión/negociación en la UI */}
            {/* Estos errores son temporales y se resuelven automáticamente */}

            {(() => {
                // Verificar si el usuario actual ya votó
                const usuarioYaVoto = resultados?.restaurantesVotados.some((r: ResultadoVotacion['restaurantesVotados'][0]) =>
                    r.votantes.some((v: ResultadoVotacion['restaurantesVotados'][0]['votantes'][0]) => v.usuarioId === auth.user?.uid)
                ) || false

                // Mostrar resultados si:
                // 1. Hay un ganador definido, O
                // 2. Todos votaron (independiente de si el usuario votó), O
                // 3. Hay votos Y el usuario actual ya votó
                // 4. La votación está cerrada
                const mostrarResultados = resultados && (
                    resultados.ganadorId || 
                    resultados.todosVotaron ||
                    resultados.estado === 'CERRADA' ||
                    (resultados.totalVotos > 0 && usuarioYaVoto)
                )

                return mostrarResultados ? (
                    <VotingResults
                        resultado={resultados}
                        onCerrarVotacion={handleCerrarVotacion}
                        onActualizarResultados={() => {
                            // Ya no se usa polling, SignalR actualiza automáticamente
                            if (resultados?.votacionId) {
                                fetchResultados(resultados.votacionId)
                            }
                        }}
                        esAdministrador={isAdmin}
                    />
                ) : (
                    <VotingPanel
                        grupoId={groupId}
                        restaurantesCandidatos={resultados.restaurantesCandidatos || []}
                        votacionActual={resultados}
                        onVotar={async () => {
                            // Recargar la votación activa para asegurar que se vea el voto inmediatamente
                            // SignalR también actualizará, pero esto da feedback inmediato
                            await fetchVotacionActiva()
                        }}
                    />
                )
            })()}
        </div>
    )
}
