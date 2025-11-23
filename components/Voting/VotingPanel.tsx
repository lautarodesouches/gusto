'use client'

import { useState } from 'react'
import { Restaurant, ResultadoVotacion } from '@/types'
import styles from './VotingPanel.module.css'

interface VotingPanelProps {
    grupoId: string
    restaurantes: Restaurant[]
    votacionActual?: ResultadoVotacion
    onVotar: () => void
}

export default function VotingPanel({
    grupoId,
    restaurantes,
    votacionActual,
    onVotar,
}: VotingPanelProps) {
    const [restauranteSeleccionado, setRestauranteSeleccionado] = useState<string>('')
    const [comentario, setComentario] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const iniciarVotacion = async () => {
        try {
            setLoading(true)
            setError('')

            const res = await fetch('/api/votacion/iniciar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grupoId,
                }),
            })

            if (!res.ok) {
                const errorText = await res.text()
                let errorData
                try {
                    errorData = JSON.parse(errorText)
                } catch {
                    errorData = { message: errorText || 'Error al iniciar votación' }
                }
                
                // Si ya existe una votación activa, recargar los datos
                if (res.status === 409) {
                    onVotar()
                    return
                }
                
                throw new Error(errorData.message || 'Error al iniciar votación')
            }

            onVotar()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido')
            console.error('[VotingPanel] Error al iniciar votación:', err)
        } finally {
            setLoading(false)
        }
    }

    const registrarVoto = async () => {
        if (!restauranteSeleccionado || !votacionActual) return

        try {
            setLoading(true)
            setError('')

            const res = await fetch(
                `/api/votacion/${votacionActual.votacionId}/votar`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        restauranteId: restauranteSeleccionado,
                        comentario: comentario || undefined,
                    }),
                }
            )

            if (!res.ok) {
                const errorText = await res.text()
                let errorData
                try {
                    errorData = JSON.parse(errorText)
                } catch {
                    errorData = { message: errorText || 'Error al votar' }
                }
                throw new Error(errorData.message || 'Error al votar')
            }

            setRestauranteSeleccionado('')
            setComentario('')
            onVotar()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido')
        } finally {
            setLoading(false)
        }
    }

    if (!votacionActual) {
        return (
            <div className={styles.container}>
                <div className={styles.noVotacion}>
                    <h3>No hay votación activa</h3>
                    <p>Inicia una votación para que los miembros elijan el restaurante</p>
                    <button
                        onClick={iniciarVotacion}
                        disabled={loading}
                        className={styles.btnPrimary}
                    >
                        {loading ? 'Iniciando...' : 'Iniciar Votación'}
                    </button>
                    {error && <p className={styles.error}>{error}</p>}
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>Votación Activa</h3>
                <span className={styles.badge}>
                    {votacionActual.totalVotos} / {votacionActual.miembrosActivos} votos
                </span>
            </div>

            <div className={styles.restaurantGrid}>
                {restaurantes.slice(0, 10).map((restaurante) => {
                    const votosRestaurante = votacionActual.restaurantesVotados.find(
                        (r) => r.restauranteId === restaurante.id
                    )
                    const cantidadVotos = votosRestaurante?.cantidadVotos || 0
                    const votantes = votosRestaurante?.votantes || []
                    const comentarios = votantes.filter(v => v.comentario)

                    return (
                        <div
                            key={restaurante.id}
                            className={`${styles.restaurantCard} ${
                                restauranteSeleccionado === restaurante.id
                                    ? styles.selected
                                    : ''
                            }`}
                            onClick={() => setRestauranteSeleccionado(restaurante.id)}
                        >
                            <div className={styles.info}>
                                <h4>{restaurante.nombre}</h4>
                                <p className={styles.address}>{restaurante.direccion}</p>
                                {cantidadVotos > 0 && (
                                    <span className={styles.votes}>
                                        ❤️ {cantidadVotos} {cantidadVotos === 1 ? 'voto' : 'votos'}
                                    </span>
                                )}
                                
                                {/* Mostrar comentarios si existen */}
                                {comentarios.length > 0 && (
                                    <div className={styles.comentariosSection}>
                                        <div className={styles.comentariosDivider}></div>
                                        {comentarios.map((votante) => (
                                            <div key={votante.usuarioId} className={styles.comentarioItem}>
                                                <div className={styles.comentarioHeader}>
                                                    {votante.usuarioFoto ? (
                                                        <img
                                                            src={votante.usuarioFoto}
                                                            alt={votante.usuarioNombre}
                                                            width="20"
                                                            height="20"
                                                            className={styles.comentarioAvatar}
                                                        />
                                                    ) : (
                                                        <div className={styles.comentarioAvatarPlaceholder}>
                                                            {votante.usuarioNombre[0]}
                                                        </div>
                                                    )}
                                                    <strong>{votante.usuarioNombre}</strong>
                                                </div>
                                                <p className={styles.comentarioTexto}>&quot;{votante.comentario}&quot;</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {restauranteSeleccionado && (
                <div className={styles.voteSection}>
                    <textarea
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        placeholder="Añade un comentario (opcional)"
                        className={styles.textarea}
                        maxLength={500}
                    />
                    <button
                        onClick={registrarVoto}
                        disabled={loading}
                        className={styles.btnPrimary}
                    >
                        {loading ? 'Votando...' : 'Confirmar Voto'}
                    </button>
                </div>
            )}

            {error && <p className={styles.error}>{error}</p>}
        </div>
    )
}
