'use client'
import { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faUser, faUsers } from '@fortawesome/free-solid-svg-icons'
import styles from './styles.module.css'
import { useToast } from '@/context/ToastContext'
import { useSignalR } from '@/context/SignalRContext'

interface NotificationBellProps {
    showPanel?: boolean
    isActive?: boolean
}

export default function NotificationBell({ showPanel = false, isActive = false }: NotificationBellProps) {
    const [mounted, setMounted] = useState(false)
    const bellRef = useRef<HTMLDivElement | null>(null)
    const panelRef = useRef<HTMLDivElement | null>(null)
    const toast = useToast()
    
    // Usar el context global de SignalR en lugar de crear nuevas conexiones
    const {
        notificaciones,
        aceptarInvitacion: aceptarInvitacionContext,
        rechazarInvitacion: rechazarInvitacionContext,
        aceptarSolicitudAmistad,
        rechazarSolicitudAmistad,
        marcarComoLeida
    } = useSignalR()

    // Acciones disponibles con manejo de errores
    const aceptarInvitacion = async (id: string) => {
        try {
            await aceptarInvitacionContext(id)
            toast.success('Invitación al grupo aceptada')
        } catch {
            toast.error('No se pudo aceptar la invitación')
        }
    }

    const rechazarInvitacion = async (id: string) => {
        try {
            await rechazarInvitacionContext(id)
            toast.info('Invitación al grupo rechazada')
        } catch {
            toast.error('No se pudo rechazar la invitación')
        }
    }

    const aceptarSolicitud = async (solicitudId: string) => {
        try {
            await aceptarSolicitudAmistad(solicitudId)
            toast.success('Solicitud de amistad aceptada')
            
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
            await rechazarSolicitudAmistad(solicitudId)
            toast.info('Solicitud de amistad rechazada')
        } catch {
            toast.error('No se pudo rechazar la solicitud')
        }
    }

    useEffect(() => {
        setMounted(true)
    }, [])

    const unreadCount = notificaciones.filter(n => !n.leida).length

    // 🔹 Render
    return (
        <div className={styles.contenedor} ref={bellRef}>
            <FontAwesomeIcon
                icon={faBell}
                className={`${styles.icono} ${isActive ? styles.icono_activo : ''}`}
            />

            {unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount}</span>
            )}

            {mounted && showPanel && (
                <div className={styles.panel} ref={panelRef} data-notification-panel="true">
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
                            // Detectar notificaciones de grupos (case-insensitive)
                            const isGrupo = n.tipo === 'notificacion' && 
                                n.tipoNotificacion && 
                                n.tipoNotificacion.toLowerCase().includes('grupo')
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
        </div>
    )
}
