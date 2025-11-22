'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { VotingPanel, VotingResults } from '@/components/Voting'
import { Votacion, ResultadoVotacion, Restaurant } from '@/types'
import styles from './styles.module.css'

interface Props {
    groupId: string
    members: unknown[]
    isAdmin?: boolean
    currentRestaurants: Restaurant[]
}

export default function GroupVoting({ groupId, members, isAdmin = false, currentRestaurants }: Props) {
    const auth = useAuth()
    const toast = useToast()
    
    const [votacionActiva, setVotacionActiva] = useState<Votacion | null>(null)
    const [resultados, setResultados] = useState<ResultadoVotacion | undefined>(undefined)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Usar los restaurantes actuales del mapa en lugar de obtenerlos una sola vez
    const restaurantes = currentRestaurants.slice(0, 10)

    // Obtener votación activa
    const fetchVotacionActiva = async () => {
        try {
            console.log('[GroupVoting] Fetching votacion activa for group:', groupId)
            const res = await fetch(`/api/votacion/grupo/${groupId}/activa`)
            console.log('[GroupVoting] Response status:', res.status)
            
            if (res.ok) {
                const data = await res.json()
                console.log('[GroupVoting] Votacion activa data:', data)
                setVotacionActiva(data)
                
                // Si hay votación activa, obtener resultados
                // El backend devuelve 'votacionId' en lugar de 'id'
                const votacionId = data?.id || data?.votacionId
                if (votacionId) {
                    console.log('[GroupVoting] Fetching resultados for votacion:', votacionId)
                    await fetchResultados(votacionId)
                } else {
                    console.log('[GroupVoting] No votacion ID in response')
                }
            } else if (res.status === 404) {
                console.log('[GroupVoting] No votacion activa (404)')
                setVotacionActiva(null)
                setResultados(undefined)
            } else {
                console.log('[GroupVoting] Unexpected status:', res.status)
                const errorText = await res.text()
                console.log('[GroupVoting] Error response:', errorText)
            }
        } catch (err) {
            console.error('[GroupVoting] Error fetching votacion activa:', err)
        } finally {
            setLoading(false)
        }
    }

    // Obtener resultados de votación
    const fetchResultados = async (votacionId: string) => {
        try {
            console.log('[GroupVoting] Fetching resultados for votacion:', votacionId)
            const res = await fetch(`/api/votacion/${votacionId}/resultados`)
            console.log('[GroupVoting] Resultados response status:', res.status)
            
            if (res.ok) {
                const data = await res.json()
                console.log('[GroupVoting] Resultados data:', data)
                setResultados(data)
            } else {
                const errorText = await res.text()
                console.log('[GroupVoting] Error fetching resultados:', errorText)
            }
        } catch (err) {
            console.error('[GroupVoting] Error fetching resultados:', err)
        }
    }

    // Iniciar votación
    const handleIniciarVotacion = async () => {
        try {
            const res = await fetch('/api/votacion/iniciar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ grupoId: groupId }),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.message || 'Error al iniciar votación')
            }

            const nuevaVotacion = await res.json()
            setVotacionActiva(nuevaVotacion)
            toast.success('¡Votación iniciada!')
            await fetchResultados(nuevaVotacion.id)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error desconocido'
            toast.error(message)
            setError(message)
        }
    }

    // Registrar voto
    const handleVotar = async (restauranteId: string, comentario?: string) => {
        if (!votacionActiva && !resultados) return

        // El backend puede devolver 'id' o 'votacionId' dependiendo del endpoint
        const votacionId = votacionActiva?.id || (votacionActiva as { votacionId?: string })?.votacionId || resultados?.votacionId
        if (!votacionId) {
            console.error('[GroupVoting] No votacion ID available')
            return
        }

        try {
            const res = await fetch(`/api/votacion/${votacionId}/votar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ restauranteId, comentario }),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.message || 'Error al registrar voto')
            }

            toast.success('¡Voto registrado!')
            await fetchResultados(votacionId)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error desconocido'
            toast.error(message)
        }
    }

    // Cerrar votación
    const handleCerrarVotacion = async (restauranteGanadorId?: string) => {
        // El backend puede devolver 'id' o 'votacionId' dependiendo del endpoint
        const votacionId = votacionActiva?.id || (votacionActiva as { votacionId?: string })?.votacionId || resultados?.votacionId
        if (!votacionId) {
            console.error('[GroupVoting] No votacion ID available for close')
            return
        }

        try {
            console.log('[GroupVoting] Cerrando votación:', votacionId)
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
            setVotacionActiva(null)
            await fetchVotacionActiva()
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error desconocido'
            toast.error(message)
        }
    }

    useEffect(() => {
        fetchVotacionActiva()
    }, [groupId])

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Cargando...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>{error}</div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Votación de Restaurantes</h2>
            
            {(() => {
                // Verificar si el usuario actual ya votó
                const usuarioYaVoto = resultados?.restaurantesVotados.some(r =>
                    r.votantes.some(v => v.usuarioId === auth.user?.uid)
                ) || false

                // Mostrar resultados si:
                // 1. Hay un ganador definido, O
                // 2. Todos votaron (independiente de si el usuario votó), O
                // 3. Hay votos Y el usuario actual ya votó
                const mostrarResultados = resultados && (
                    resultados.ganadorId || 
                    resultados.todosVotaron ||
                    (resultados.totalVotos > 0 && usuarioYaVoto)
                )

                return mostrarResultados ? (
                    <VotingResults
                        resultado={resultados}
                        onCerrarVotacion={handleCerrarVotacion}
                        onActualizarResultados={() => {
                            const votacionId = votacionActiva?.id || (votacionActiva as { votacionId?: string })?.votacionId || resultados?.votacionId
                            if (votacionId) {
                                fetchResultados(votacionId)
                            }
                        }}
                        esAdministrador={isAdmin}
                    />
                ) : (
                    <VotingPanel
                        grupoId={groupId}
                        restaurantes={restaurantes}
                        votacionActual={resultados}
                        onVotar={async () => {
                            await fetchVotacionActiva()
                        }}
                    />
                )
            })()}
        </div>
    )
}
