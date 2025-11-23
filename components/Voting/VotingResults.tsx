'use client'

import { useState, useEffect } from 'react'
import { ResultadoVotacion } from '@/types'
import TieBreaker from '@/components/Voting/TieBreaker'
import styles from './VotingResults.module.css'

interface VotingResultsProps {
    resultado: ResultadoVotacion
    onCerrarVotacion?: (restauranteId?: string) => void
    onActualizarResultados?: () => void
    esAdministrador: boolean
}

export default function VotingResults({
    resultado,
    onCerrarVotacion,
    onActualizarResultados,
    esAdministrador,
}: VotingResultsProps) {
    const [mostrarRuleta, setMostrarRuleta] = useState(false)
    const [votantesExpandidos, setVotantesExpandidos] = useState<Record<string, boolean>>({})

    const toggleVotantes = (restauranteId: string) => {
        setVotantesExpandidos(prev => ({
            ...prev,
            [restauranteId]: !prev[restauranteId]
        }))
    }

    useEffect(() => {
        if (!onActualizarResultados) return

        const interval = setInterval(() => {
            onActualizarResultados()
        }, 3000)

        return () => clearInterval(interval)
    }, [onActualizarResultados])

    const restaurantesOrdenados = [...resultado.restaurantesVotados].sort(
        (a, b) => b.cantidadVotos - a.cantidadVotos
    )

    
    const ganador = resultado.ganadorId
        ? resultado.restaurantesVotados.find((r) => r.restauranteId === resultado.ganadorId)
        : null

    const handleGanadorRuleta = async (restauranteId: string) => {
        try {
            const res = await fetch(`/api/votacion/${resultado.votacionId}/seleccionar-ganador`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ restauranteGanadorId: restauranteId })
            })

            if (res.ok) {
                setMostrarRuleta(false)
                if (onActualizarResultados) {
                    onActualizarResultados()
                }
            } else {
                const errorData = await res.json()
                console.error('Error al seleccionar ganador:', errorData)
                if (res.status === 400 || res.status === 409) {
                    setMostrarRuleta(false)
                    if (onActualizarResultados) {
                        onActualizarResultados()
                    }
                }
            }
        } catch (error) {
            console.error('Error al seleccionar ganador:', error)
            setMostrarRuleta(false)
        }
    }

    const _cerrarVotacionSinGanador = () => {
        if (onCerrarVotacion) {
            onCerrarVotacion()
        }
    }


    if (resultado.hayEmpate && !ganador && mostrarRuleta) {
        const restaurantesEmpatados = resultado.restaurantesVotados.filter((r) =>
            resultado.restaurantesEmpatados.includes(r.restauranteId)
        )

        return (
            <TieBreaker
                restaurantes={restaurantesEmpatados}
                onGanador={handleGanadorRuleta}
            />
        )
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h2>Resultados de la Votación</h2>
                <div className={styles.stats}>
                    <span className={styles.stat}>
                        📊 {resultado.totalVotos} votos
                    </span>
                    <span className={styles.stat}>
                        👥 {resultado.miembrosActivos} miembros activos
                    </span>
                </div>
            </div>

            {/* Estado */}
            {!resultado.todosVotaron && !ganador && (
                <div className={styles.waiting}>
                    ⏳ Esperando a que todos los miembros voten...
                </div>
            )}

            {/* Mostrar ganador si existe (independiente de si todos votaron) */}
            {ganador ? (
                <div className={styles.ganador}>
                    <h3>🏆 ¡Ganador!</h3>
                    {resultado.hayEmpate && (
                        <p className={styles.ruletaNote}>
                            ✨ Seleccionado por ruleta - Resultado final
                        </p>
                    )}
                    <div className={styles.ganadorCard}>
                        <div className={styles.ganadorInfo}>
                            <h4>{ganador.restauranteNombre}</h4>
                            <p>{ganador.restauranteDireccion}</p>
                            <span className={styles.votosGanador}>
                                ❤️ {ganador.cantidadVotos}{' '}
                                {ganador.cantidadVotos === 1 ? 'voto' : 'votos'}
                            </span>
                        </div>
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ganador.restauranteDireccion)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.btnDirecciones}
                        >
                            📍 Cómo llegar
                        </a>
                    </div>
                </div>
            ) : resultado.hayEmpate && resultado.todosVotaron && !resultado.ganadorId ? (
                <div className={styles.empate}>
                    <h3>🎲 ¡Hay un empate!</h3>
                    <p>
                        {resultado.restaurantesEmpatados.length} restaurantes
                        empatados
                    </p>
                    <p className={styles.ruletaInstruccion}>
                        Un miembro puede girar la ruleta para decidir el ganador
                    </p>
                    <button
                        onClick={() => setMostrarRuleta(true)}
                        className={styles.btnRuleta}
                    >
                        Resolver con Ruleta
                    </button>
                </div>
            ) : null}

            {/* Lista de resultados */}
            <div className={styles.resultados}>
                <h3>Todos los votos</h3>
                {restaurantesOrdenados.map((restaurante) => (
                    <div key={restaurante.restauranteId} className={styles.resultadoCard}>
                        <div className={styles.restauranteInfo}>
                            <div>
                                <h4>{restaurante.restauranteNombre}</h4>
                                <p>{restaurante.restauranteDireccion}</p>
                                
                                {/* Comentarios visibles */}
                                {restaurante.votantes.some(v => v.comentario) && (
                                    <div className={styles.comentarios}>
                                        {restaurante.votantes
                                            .filter(v => v.comentario)
                                            .map((votante) => (
                                                <div key={votante.usuarioId} className={styles.comentario}>
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
                                                        <strong>{votante.usuarioNombre}:</strong>
                                                    </div>
                                                    <p className={styles.comentarioTexto}>{votante.comentario}</p>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.votos}>
                            <span className={styles.votosCount}>
                                {restaurante.cantidadVotos}
                            </span>
                            <span className={styles.votosLabel}>
                                {restaurante.cantidadVotos === 1 ? 'voto' : 'votos'}
                            </span>
                        </div>
                        {/* Botón para mostrar votantes */}
                        {restaurante.votantes.length > 0 && (
                            <div className={styles.votantesSection}>
                                <button
                                    onClick={() => toggleVotantes(restaurante.restauranteId)}
                                    className={styles.btnToggleVotantes}
                                >
                                    {votantesExpandidos[restaurante.restauranteId] ? '▲' : '▼'} Ver votantes
                                </button>
                                {votantesExpandidos[restaurante.restauranteId] && (
                                    <div className={styles.votantesContainer}>
                                        <div className={styles.votantes}>
                                            {restaurante.votantes.map((votante) => (
                                                <div
                                                    key={votante.usuarioId}
                                                    className={styles.votante}
                                                >
                                                    {votante.usuarioFoto ? (
                                                        <img
                                                            src={votante.usuarioFoto}
                                                            alt={votante.usuarioNombre}
                                                            width="32"
                                                            height="32"
                                                            className={styles.avatar}
                                                        />
                                                    ) : (
                                                        <div className={styles.avatarPlaceholder}>
                                                            {votante.usuarioNombre[0]}
                                                        </div>
                                                    )}
                                                    <span className={styles.votanteNombre}>
                                                        {votante.usuarioNombre}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Botones de administrador */}
            {esAdministrador ? (
                <div className={styles.actions}>
                    <button
                        onClick={() => {
                            if (onCerrarVotacion) {
                                onCerrarVotacion(resultado.ganadorId || undefined)
                            }
                        }}
                        className={resultado.ganadorId ? styles.btnPrimary : styles.btnSecondary}
                    >
                        {resultado.ganadorId ? '🎉 Confirmar Ganador y Cerrar Votación' : 'Cerrar Votación'}
                    </button>
                </div>
            ) : (
                <p style={{ textAlign: 'center', color: '#999', marginTop: '2rem' }}>
                    Solo el administrador puede cerrar la votación
                </p>
            )}
        </div>
    )
}
