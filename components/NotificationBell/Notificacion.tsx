'use client'
import { useEffect, useState, useRef } from 'react'
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faUser, faUsers } from '@fortawesome/free-solid-svg-icons'
import styles from './NotificationBell.module.css'
import { API_URL } from '@/constants'
import { useToast } from '@/context/ToastContext'
import { SolicitudAmistadResponse } from '@/types'

interface Notificacion {
    id: string
    titulo: string
    mensaje: string
    tipo: string
    leida: boolean
    fechaCreacion: string
}

interface UnifiedNotification {
    id: string
    tipo: 'notificacion' | 'solicitud_amistad'
    titulo: string
    mensaje: string
    leida: boolean
    fechaCreacion: string
    tipoNotificacion?: string // Para guardar el tipo original de la notificación (ej: 'InvitacionGrupo')
    solicitudAmistad?: SolicitudAmistadResponse
}

interface NotificationBellProps {
    showPanel?: boolean
    isActive?: boolean
}

export default function NotificationBell({ showPanel = false, isActive = false }: NotificationBellProps) {
    const [notificacionesConnection, setNotificacionesConnection] = useState<HubConnection | null>(null)
    const [solicitudesConnection, setSolicitudesConnection] = useState<HubConnection | null>(null)
    const [notificaciones, setNotificaciones] = useState<UnifiedNotification[]>([])
    const panelRef = useRef<HTMLDivElement | null>(null)
    const toast = useToast()

    // Conexión con el Hub de Notificaciones
    useEffect(() => {
        const connectNotificaciones = async () => {
            try {
                const conn = new HubConnectionBuilder()
                    .withUrl(`${API_URL}/notificacionesHub`, {
                        withCredentials: true,
                    })
                    .withAutomaticReconnect()
                    .build()

                // Cargar notificaciones iniciales al conectar
                conn.on('CargarNotificaciones', (data: Notificacion[]) => {
                    setNotificaciones(prev => {
                        const existingIds = new Set(prev.map(n => n.id))
                        const newNotifs = data
                            .filter(n => !existingIds.has(n.id))
                            .map(n => ({
                                id: n.id,
                                tipo: 'notificacion' as const,
                                titulo: n.titulo,
                                mensaje: n.mensaje,
                                leida: n.leida,
                                fechaCreacion: n.fechaCreacion,
                                tipoNotificacion: n.tipo,
                            }))
                        return [...newNotifs, ...prev.filter(n => n.tipo === 'solicitud_amistad')]
                            .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
                    })
                })

                // Nueva notificación recibida en tiempo real
                conn.on('RecibirNotificacion', (notif: Notificacion) => {
                    setNotificaciones(prev => {
                        const exists = prev.some(n => n.id === notif.id)
                        if (exists) return prev
                        const newNotif: UnifiedNotification = {
                            id: notif.id,
                            tipo: 'notificacion',
                            titulo: notif.titulo,
                            mensaje: notif.mensaje,
                            leida: notif.leida,
                            fechaCreacion: notif.fechaCreacion,
                            tipoNotificacion: notif.tipo,
                        }
                        return [newNotif, ...prev].sort((a, b) => 
                            new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
                        )
                    })
                })

                // Eliminar notificación si el servidor lo indica
                conn.on('NotificacionEliminada', (id: string) => {
                    setNotificaciones(prev => prev.filter(n => n.id !== id))
                })

                await conn.start()
                setNotificacionesConnection(conn)
            } catch {
                // Error conectando con NotificationHub
            }
        }

        connectNotificaciones()

        return () => {
            if (notificacionesConnection) {
                notificacionesConnection.stop()
            }
        }
    }, [])

    // Conexión con el Hub de Solicitudes de Amistad
    useEffect(() => {
        const connectSolicitudes = async () => {
            try {
                const conn = new HubConnectionBuilder()
                    .withUrl(`${API_URL}/solicitudesAmistadHub`, {
                        withCredentials: true,
                    })
                    .withAutomaticReconnect()
                    .build()

                // Cargar solicitudes pendientes al conectar
                conn.on('SolicitudesPendientes', (data: SolicitudAmistadResponse[]) => {
                    setNotificaciones(prev => {
                        const existingIds = new Set(prev.map(n => n.id))
                        const newSolicitudes = data
                            .filter(s => !existingIds.has(s.id))
                            .map(s => ({
                                id: s.id,
                                tipo: 'solicitud_amistad' as const,
                                titulo: 'Solicitud de amistad',
                                mensaje: `${s.remitente.nombre} quiere ser tu amigo.`,
                                leida: false,
                                fechaCreacion: s.fechaEnvio,
                                solicitudAmistad: s,
                            }))
                        return [...newSolicitudes, ...prev.filter(n => n.tipo === 'notificacion')]
                            .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
                    })
                })

                // Nueva solicitud recibida en tiempo real
                conn.on('RecibirSolicitudAmistad', (solicitud: SolicitudAmistadResponse) => {
                    setNotificaciones(prev => {
                        const exists = prev.some(n => n.id === solicitud.id)
                        if (exists) return prev
                        const newSolicitud: UnifiedNotification = {
                            id: solicitud.id,
                            tipo: 'solicitud_amistad',
                            titulo: 'Solicitud de amistad',
                            mensaje: `${solicitud.remitente.nombre} quiere ser tu amigo.`,
                            leida: false,
                            fechaCreacion: solicitud.fechaEnvio,
                            solicitudAmistad: solicitud,
                        }
                        return [newSolicitud, ...prev].sort((a, b) => 
                            new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
                        )
                    })
                })

                // Solicitud eliminada (aceptada/rechazada)
                conn.on('SolicitudEliminada', (id: string) => {
                    setNotificaciones(prev => prev.filter(n => n.id !== id))
                })

                await conn.start()
                setSolicitudesConnection(conn)
            } catch {
                // Error conectando con SolicitudesAmistadHub
            }
        }

        connectSolicitudes()

        return () => {
            if (solicitudesConnection) {
                solicitudesConnection.stop()
            }
        }
    }, [])

    // Ya no necesitamos cerrar el panel aquí, lo maneja ProfileBar

    // Acciones disponibles
    const aceptarInvitacion = async (id: string) => {
        try {
            await notificacionesConnection?.invoke('AceptarInvitacion', id)
            toast.success('Invitación al grupo aceptada')
            setNotificaciones(prev => prev.filter(n => n.id !== id))
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('groups:refresh'))
            }
        } catch {
            toast.error('No se pudo aceptar la invitación')
        }
    }

    const rechazarInvitacion = async (id: string) => {
        try {
            await notificacionesConnection?.invoke('RechazarInvitacion', id)
            toast.info('Invitación al grupo rechazada')
            setNotificaciones(prev => prev.filter(n => n.id !== id))
        } catch {
            toast.error('No se pudo rechazar la invitación')
        }
    }

    const aceptarSolicitud = async (solicitudId: string) => {
        try {
            await solicitudesConnection?.invoke('AceptarSolicitud', solicitudId)
            toast.success('Solicitud de amistad aceptada')
            setNotificaciones(prev => prev.filter(n => n.id !== solicitudId))
            
            // Refrescar lista de amigos
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('friends:refresh'))
            }
        } catch {
            toast.error('No se pudo aceptar la solicitud')
        }
    }

    const rechazarSolicitud = async (solicitudId: string) => {
        try {
            await solicitudesConnection?.invoke('RechazarSolicitud', solicitudId)
            toast.info('Solicitud de amistad rechazada')
            setNotificaciones(prev => prev.filter(n => n.id !== solicitudId))
        } catch {
            toast.error('No se pudo rechazar la solicitud')
        }
    }

    const marcarComoLeida = (id: string) => {
        setNotificaciones(prev =>
            prev.map(n => (n.id === id ? { ...n, leida: true } : n))
        )
    }

    const unreadCount = notificaciones.filter(n => !n.leida).length

    // 🔹 Render
    return (
        <>
            <div className={styles.contenedor}>
                <FontAwesomeIcon
                    icon={faBell}
                    className={`${styles.icono} ${isActive ? styles.icono_activo : ''}`}
                />

                {unreadCount > 0 && (
                    <span className={styles.badge}>{unreadCount}</span>
                )}
            </div>

            {showPanel && (
                <div className={styles.panel} ref={panelRef}>
                    <h4>
                        Notificaciones
                        {unreadCount > 0 && (
                            <span style={{ 
                                fontSize: '0.85rem', 
                                color: 'var(--light)', 
                                fontWeight: 'normal' 
                            }}>
                                {' '}({unreadCount} nueva{unreadCount !== 1 ? 's' : ''})
                            </span>
                        )}
                    </h4>
                    <div className={styles.contenido}>
                        {notificaciones.length === 0 && (
                            <p>Sin notificaciones</p>
                        )}

                        {notificaciones.map(n => {
                            const isAmistad = n.tipo === 'solicitud_amistad'
                            const isGrupo = n.tipo === 'notificacion' && n.tipoNotificacion === 'InvitacionGrupo'
                            const hasActions = isAmistad || isGrupo

                            return (
                                <div
                                    key={n.id}
                                    onClick={() => marcarComoLeida(n.id)}
                                    className={`${styles.item} ${
                                        n.leida ? styles.leida : ''
                                    } ${hasActions ? styles.item_withActions : ''}`}
                                >
                                    {/* Título primero */}
                                    <strong className={styles.titulo}>
                                        {n.titulo}
                                    </strong>

                                    {/* Información de la persona/grupo */}
                                    {isAmistad && n.solicitudAmistad && (
                                        <div className={styles.item__info}>
                                            <div className={styles.item__avatar}>
                                                {n.solicitudAmistad.remitente.fotoPerfilUrl ? (
                                                    <img
                                                        src={n.solicitudAmistad.remitente.fotoPerfilUrl}
                                                        alt={n.solicitudAmistad.remitente.nombre}
                                                    />
                                                ) : (
                                                    <FontAwesomeIcon icon={faUser} className={styles.item__avatarIcon} />
                                                )}
                                            </div>
                                            <div className={styles.item__details}>
                                                <span className={styles.item__name}>
                                                    {n.solicitudAmistad.remitente.nombre}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {isGrupo && (
                                        <div className={styles.item__info}>
                                            <div className={styles.item__avatar}>
                                                <FontAwesomeIcon icon={faUsers} className={styles.item__avatarIcon} />
                                            </div>
                                            <div className={styles.item__details}>
                                                <span className={styles.item__name}>
                                                    {n.mensaje || 'Grupo'}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Mensaje (solo si no es amistad o grupo, o si hay mensaje adicional) */}
                                    {!isAmistad && !isGrupo && (
                                        <p className={styles.mensaje}>
                                            {n.mensaje}
                                        </p>
                                    )}

                                    {/* Hora */}
                                    <small className={styles.hora}>
                                        {new Date(
                                            n.fechaCreacion
                                        ).toLocaleString('es-AR', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            day: '2-digit',
                                            month: '2-digit',
                                        })}
                                    </small>

                                    {/* Botones para invitaciones de grupo */}
                                    {isGrupo && (
                                        <div className={styles.acciones}>
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation()
                                                    aceptarInvitacion(n.id)
                                                }}
                                                className={styles.aceptar}
                                            >
                                                Aceptar
                                            </button>
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation()
                                                    rechazarInvitacion(n.id)
                                                }}
                                                className={styles.rechazar}
                                            >
                                                Rechazar
                                            </button>
                                        </div>
                                    )}

                                    {/* Botones para solicitudes de amistad */}
                                    {isAmistad && (
                                        <div className={styles.acciones}>
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation()
                                                    aceptarSolicitud(n.id)
                                                }}
                                                className={styles.aceptar}
                                            >
                                                Aceptar
                                            </button>
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation()
                                                    rechazarSolicitud(n.id)
                                                }}
                                                className={styles.rechazar}
                                            >
                                                Rechazar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </>
    )
}
