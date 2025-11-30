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
    const [showNoRestaurantsModal, setShowNoRestaurantsModal] = useState(false)

    const iniciarVotacion = async () => {
        // Validar que haya restaurantes seleccionados
        if (!restaurantes || restaurantes.length === 0) {
            setShowNoRestaurantsModal(true)
            return
        }

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
            <>
                {/* Modal de alerta - No hay restaurantes */}
                {showNoRestaurantsModal && (
                    <div className={styles.modalBackdrop} onClick={() => setShowNoRestaurantsModal(false)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                    <line x1="12" y1="9" x2="12" y2="13"/>
                                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                                </svg>
                            </div>
                            <h3 className={styles.modalTitle}>No hay restaurantes seleccionados</h3>
                            <p className={styles.modalMessage}>
                                Para iniciar una votación, primero debes buscar los restaurantes en el <strong>mapa</strong>.
                            </p>
                            <p className={styles.modalSteps}>
                                1. Ve al <strong>mapa</strong><br/>
                                2. Busca los restaurantes que quieras votar<br/>
                                3. Vuelve aquí para iniciar la votación
                            </p>
                            <button 
                                onClick={() => setShowNoRestaurantsModal(false)}
                                className={styles.modalButton}
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                )}

                <div className={styles.container}>
                    <div className={styles.noVotacion}>
                        <h3>No hay votación activa</h3>
                        <p>Inicia una votación para que los miembros elijan el restaurante</p>
                        
                        {/* Nota informativa */}
                        <div className={styles.infoNote}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="16" x2="12" y2="12"/>
                                <line x1="12" y1="8" x2="12.01" y2="8"/>
                            </svg>
                            <span>Recuerda buscar primero los restaurantes en el <strong>mapa</strong> antes de iniciar una votación</span>
                        </div>

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
            </>
        )
    }

    // Si hay votación activa pero no hay restaurantes en el mapa
    if (votacionActual && (!restaurantes || restaurantes.length === 0)) {
        return (
            <div className={styles.container}>
                <div className={styles.noRestaurantsWarning}>
                    <div className={styles.warningIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    </div>
                    <h3 className={styles.warningTitle}>Votación activa sin restaurantes</h3>
                    <p className={styles.warningMessage}>
                        Hay una votación en curso, pero no tienes restaurantes mostrados en el mapa.
                    </p>
                    <div className={styles.warningSteps}>
                        <p className={styles.stepsTitle}>Para participar en la votación:</p>
                        <ol className={styles.stepsList}>
                            <li>Ve a la pestaña <strong>Mapa</strong></li>
                            <li>Busca los restaurantes que quieres que estén disponibles para votar</li>
                            <li>Regresa a <strong>Votación</strong> para emitir tu voto</li>
                        </ol>
                    </div>
                    <div className={styles.votacionInfo}>
                        <p>
                            <strong>Votos actuales:</strong> {votacionActual.totalVotos} / {votacionActual.miembrosActivos}
                        </p>
                    </div>
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
                        (r: ResultadoVotacion['restaurantesVotados'][0]) => r.restauranteId === restaurante.id
                    )
                    const cantidadVotos = votosRestaurante?.cantidadVotos || 0
                    const votantes = votosRestaurante?.votantes || []
                    const comentarios = votantes.filter((v: ResultadoVotacion['restaurantesVotados'][0]['votantes'][0]) => v.comentario)

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
                                        {comentarios.map((votante: ResultadoVotacion['restaurantesVotados'][0]['votantes'][0]) => (
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
