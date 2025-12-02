'use client'

import { useState, useMemo } from 'react'
import { ResultadoVotacion, RestauranteCandidato, Restaurant, VotanteInfo, GroupMember } from '@/types'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'
import styles from './VotingPanel.module.css'

// Tipo extendido para VotanteInfo que incluye FirebaseUid en PascalCase
type VotanteInfoConFirebase = VotanteInfo & {
    FirebaseUid?: string
}

interface VotingPanelProps {
    grupoId: string
    restaurantesCandidatos: RestauranteCandidato[]
    votacionActual?: ResultadoVotacion
    onVotar: () => void
    soyAdministrador?: boolean
    restaurantesDelMapa?: Restaurant[] // Para pasar al iniciar votación
    miembros?: (GroupMember & { checked: boolean })[] // Miembros del grupo para mostrar quiénes participarán
}

export default function VotingPanel({
    grupoId,
    restaurantesCandidatos,
    votacionActual,
    onVotar,
    soyAdministrador = false,
    restaurantesDelMapa = [],
    miembros = [],
}: VotingPanelProps) {
    const toast = useToast()
    const auth = useAuth()
    const [restauranteSeleccionado, setRestauranteSeleccionado] = useState<string>('')
    const [comentario, setComentario] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [miembrosExpandidos, setMiembrosExpandidos] = useState(false)

    // Verificar si el usuario actual ya votó y a qué restaurante
    // Usar useMemo para recalcular cuando cambie votacionActual o auth.user
    const { miVoto, restauranteVotado } = useMemo(() => {
        if (!votacionActual || !auth.user?.uid) {
            return { miVoto: null, restauranteVotado: null }
        }

        // Buscar en qué restaurante votó el usuario actual
        // El backend envía FirebaseUid en PascalCase en VotanteInfo
        const miFirebaseUid = auth.user?.uid
        const votoEncontrado = votacionActual.restaurantesVotados.find((r: ResultadoVotacion['restaurantesVotados'][0]) =>
            r.votantes.some((v: VotanteInfoConFirebase) => {
                // El backend envía FirebaseUid en PascalCase (como el backend recomendó)
                const votanteFirebaseUid = v.FirebaseUid || v.firebaseUid
                const coincide = votanteFirebaseUid === miFirebaseUid

                // Debug para ver qué está pasando
                if (miFirebaseUid) {
                    console.log('[VotingPanel] Comparando voto:', {
                        votanteFirebaseUid,
                        miFirebaseUid,
                        coincide,
                        restauranteId: r.restauranteId,
                        tieneFirebaseUid: !!v.FirebaseUid,
                        tieneFirebaseUidCamel: !!v.firebaseUid
                    })
                }

                return coincide
            })
        )

        const restaurante = votoEncontrado
            ? restaurantesCandidatos.find(c => c.restauranteId === votoEncontrado.restauranteId)
            : null

        // Debug: loggear el estado del voto
        console.log('[VotingPanel] Estado del voto (useMemo):', {
            hayVotacion: !!votacionActual,
            miUid: auth.user.uid,
            restaurantesVotados: votacionActual.restaurantesVotados.map(r => ({
                restauranteId: r.restauranteId,
                votantes: r.votantes.map((v: VotanteInfoConFirebase) => ({
                    usuarioId: v.usuarioId,
                    nombre: v.usuarioNombre,
                    firebaseUid: v.FirebaseUid || v.firebaseUid || 'NO_ENCONTRADO'
                }))
            })),
            votoEncontrado: votoEncontrado ? votoEncontrado.restauranteId : null,
            restaurante: restaurante?.nombre || null,
            votoEncontrado_bool: !!votoEncontrado
        })

        return { miVoto: votoEncontrado, restauranteVotado: restaurante }
    }, [votacionActual, auth.user?.uid, restaurantesCandidatos])

    const iniciarVotacion = async () => {
        // Validar que haya restaurantes del mapa para usar como candidatos
        if (!restaurantesDelMapa || restaurantesDelMapa.length === 0) {
            setError('Primero debes buscar restaurantes en el mapa')
            toast.error('No hay restaurantes seleccionados. Ve al mapa y busca restaurantes.')
            return
        }

        try {
            setLoading(true)
            setError('')

            // Extraer solo los IDs de los restaurantes visibles en el mapa
            const restaurantesCandidatos = restaurantesDelMapa.map(r => r.id)

            const res = await fetch('/api/votacion/iniciar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grupoId,
                    restaurantesCandidatos,
                    // descripcion no se envía (opcional, el backend lo maneja como null)
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

            // ✅ Solo verificamos 200 OK
            // ✅ NO manejamos la respuesta (no contiene candidatos)
            // ✅ SignalR enviará "votacionIniciada" y actualizará todo automáticamente
            toast.success('¡Votación iniciada!')

            // 🔥 Recargar inmediatamente para mostrar la votación activa
            // SignalR también actualizará cuando llegue el evento, pero esto da feedback inmediato
            if (onVotar) {
                // Pequeño delay para asegurar que el backend procesó la votación
                setTimeout(() => {
                    onVotar()
                }, 300)
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error desconocido'
            setError(message)
            toast.error(message)
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

            toast.success('¡Voto registrado!')
            setRestauranteSeleccionado('')
            setComentario('')
            
            // 🔥 Notificar que el usuario acaba de votar para ignorar el evento SignalR
            // Esto evita que se muestre el toast informativo cuando el usuario acaba de votar
            if (typeof window !== 'undefined') {
                window.dispatchEvent(
                    new CustomEvent('usuario:voto:registrado', {
                        detail: {
                            restauranteId: restauranteSeleccionado,
                            timestamp: Date.now()
                        }
                    })
                )
            }
            
            // SignalR actualizará automáticamente, pero también recargamos para asegurar que se vea el cambio
            // Pequeño delay para que el backend procese el voto
            setTimeout(() => {
                if (onVotar) {
                    onVotar()
                }
            }, 500)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error desconocido'
            setError(message)
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    // Si no hay votación activa, mostrar botón para iniciar
    if (!votacionActual) {
        return (
            <div className={styles.container}>
                <div className={styles.noVotacion}>
                    <h3>No hay votación activa</h3>
                    <p>Inicia una votación para que los miembros elijan el restaurante</p>

                    {/* Nota informativa */}
                    <div className={styles.infoNote}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        <span>
                            {restaurantesDelMapa.length > 0
                                ? `Hay ${restaurantesDelMapa.length} restaurante${restaurantesDelMapa.length > 1 ? 's' : ''} disponible${restaurantesDelMapa.length > 1 ? 's' : ''} del mapa para votar`
                                : 'Ve al mapa y busca restaurantes antes de iniciar una votación'}
                        </span>
                    </div>

                    {/* Listado de miembros que participarán en la votación */}
                    {(() => {
                        const miembrosActivos = miembros.filter(m => m.checked)
                        if (miembrosActivos.length === 0) return null

                        return (
                            <div className={styles.miembrosPreview}>
                                <button
                                    type="button"
                                    onClick={() => setMiembrosExpandidos(!miembrosExpandidos)}
                                    className={styles.miembrosPreviewToggle}
                                >
                                    <div className={styles.miembrosPreviewHeader}>
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            width="20" 
                                            height="20" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                        >
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                        <span className={styles.miembrosPreviewTitle}>
                                            {miembrosActivos.length} miembro{miembrosActivos.length > 1 ? 's' : ''} participarán en la votación
                                        </span>
                                    </div>
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        width="20" 
                                        height="20" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                        className={`${styles.miembrosPreviewIcon} ${miembrosExpandidos ? styles.expanded : ''}`}
                                    >
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </button>
                                {miembrosExpandidos && (
                                    <div className={styles.miembrosPreviewList}>
                                        {miembrosActivos.map((miembro) => (
                                            <div key={miembro.id} className={styles.miembroPreviewItem}>
                                                {miembro.fotoPerfilUrl ? (
                                                    <img 
                                                        src={miembro.fotoPerfilUrl} 
                                                        alt={miembro.usuarioNombre}
                                                        className={styles.miembroPreviewAvatar}
                                                    />
                                                ) : (
                                                    <div className={styles.miembroPreviewAvatarPlaceholder}>
                                                        {miembro.usuarioNombre[0].toUpperCase()}
                                                    </div>
                                                )}
                                                <span className={styles.miembroPreviewNombre}>{miembro.usuarioNombre}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })()}

                    {/* Previsualización de restaurantes disponibles */}
                    {restaurantesDelMapa.length > 0 && (
                        <div className={styles.restaurantesPreview}>
                            <h4 className={styles.restaurantesPreviewTitle}>
                                🍽️ Restaurantes que se incluirán en la votación:
                            </h4>
                            <div className={styles.restaurantesPreviewList}>
                                {restaurantesDelMapa.slice(0, 10).map((restaurante) => (
                                    <div key={restaurante.id} className={styles.restaurantePreviewItem}>
                                        {restaurante.imagenUrl && (
                                            <img 
                                                src={restaurante.imagenUrl} 
                                                alt={restaurante.nombre}
                                                className={styles.restaurantePreviewImage}
                                            />
                                        )}
                                        <div className={styles.restaurantePreviewInfo}>
                                            <span className={styles.restaurantePreviewNombre}>{restaurante.nombre}</span>
                                            {restaurante.direccion && (
                                                <span className={styles.restaurantePreviewDireccion}>{restaurante.direccion}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {restaurantesDelMapa.length > 10 && (
                                    <div className={styles.restaurantesPreviewMore}>
                                        + {restaurantesDelMapa.length - 10} restaurante{restaurantesDelMapa.length - 10 > 1 ? 's' : ''} más
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {soyAdministrador && (
                        <>
                            <button
                                onClick={iniciarVotacion}
                                disabled={loading || restaurantesDelMapa.length === 0}
                                className={styles.btnPrimary}
                            >
                                {loading ? 'Iniciando...' : 'Iniciar Votación'}
                            </button>
                            {restaurantesDelMapa.length === 0 && (
                                <p style={{ color: '#fbbf24', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                                    ⚠️ No hay restaurantes en el mapa. Ve a la pestaña &quot;Mapa&quot; y busca restaurantes.
                                </p>
                            )}
                        </>
                    )}
                    {!soyAdministrador && (
                        <p style={{ color: '#999', marginTop: '1rem' }}>
                            Solo el administrador puede iniciar una votación
                        </p>
                    )}
                    {error && <p className={styles.error}>{error}</p>}
                </div>
            </div>
        )
    }

    // Si no hay candidatos, mostrar mensaje
    if (!restaurantesCandidatos || restaurantesCandidatos.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.noRestaurantsWarning}>
                    <h3 className={styles.warningTitle}>No hay restaurantes candidatos</h3>
                    <p className={styles.warningMessage}>
                        La votación está activa pero no hay restaurantes disponibles para votar.
                    </p>
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

            {/* Mostrar mensaje si el usuario ya votó */}
            {restauranteVotado && (
                <div className={styles.votoInfo}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span>Has votado a: <strong>{restauranteVotado.nombre}</strong></span>
                </div>
            )}

            <div className={styles.restaurantGrid}>
                {restaurantesCandidatos.map((candidato) => {
                    const votosRestaurante = votacionActual.restaurantesVotados.find(
                        (r: ResultadoVotacion['restaurantesVotados'][0]) => r.restauranteId === candidato.restauranteId
                    )
                    const cantidadVotos = votosRestaurante?.cantidadVotos || 0
                    const votantes = votosRestaurante?.votantes || []
                    const comentarios = votantes.filter((v: ResultadoVotacion['restaurantesVotados'][0]['votantes'][0]) => v.comentario)

                    // Verificar si el usuario votó a este restaurante
                    // Verificar tanto con miVoto como directamente en los votantes por si acaso
                    const miFirebaseUid = auth.user?.uid
                    const yoVoteAEste = miVoto?.restauranteId === candidato.restauranteId ||
                        votosRestaurante?.votantes.some((v: VotanteInfoConFirebase) => {
                            // El backend envía FirebaseUid en PascalCase (como el backend recomendó)
                            const votanteFirebaseUid = v.FirebaseUid || v.firebaseUid
                            return votanteFirebaseUid === miFirebaseUid
                        }) || false

                    return (
                        <div
                            key={candidato.restauranteId}
                            className={`${styles.restaurantCard} ${restauranteSeleccionado === candidato.restauranteId
                                    ? styles.selected
                                    : ''
                                } ${yoVoteAEste ? styles.voted : ''}`}
                            onClick={() => {
                                // Permitir cambiar el voto seleccionando otro restaurante
                                // El backend maneja la actualización del voto
                                setRestauranteSeleccionado(candidato.restauranteId)
                            }}
                        >
                            {candidato.imagenUrl && (
                                <img
                                    src={candidato.imagenUrl}
                                    alt={candidato.nombre}
                                    className={styles.restaurantImage}
                                />
                            )}
                            <div className={styles.info}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <h4>{candidato.nombre}</h4>
                                    {yoVoteAEste && (
                                        <span className={styles.votedBadge} title="Has votado a este restaurante">
                                            ✓ Tu voto
                                        </span>
                                    )}
                                </div>
                                <p className={styles.address}>{candidato.direccion}</p>
                                {cantidadVotos > 0 && (
                                    <span className={styles.votes}>
                                        {cantidadVotos} {cantidadVotos === 1 ? 'voto' : 'votos'}
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

            {/* Mostrar sección de voto si hay un restaurante seleccionado */}
            {/* Permite cambiar el voto si ya votó anteriormente */}
            {restauranteSeleccionado && (
                <div className={styles.voteSection}>
                    {restauranteVotado && restauranteSeleccionado !== restauranteVotado.restauranteId && (
                        <div className={styles.changeVoteNote}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 9v4"/>
                                <path d="M12 17h.01"/>
                                <circle cx="12" cy="12" r="10"/>
                            </svg>
                            <span>Cambiarás tu voto de <strong>{restauranteVotado.nombre}</strong> a <strong>{restaurantesCandidatos.find(c => c.restauranteId === restauranteSeleccionado)?.nombre}</strong></span>
                        </div>
                    )}
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
                        {loading ? 'Votando...' : restauranteVotado && restauranteSeleccionado !== restauranteVotado.restauranteId ? 'Cambiar Voto' : 'Confirmar Voto'}
                    </button>
                </div>
            )}

            {error && <p className={styles.error}>{error}</p>}
        </div>
    )
}
