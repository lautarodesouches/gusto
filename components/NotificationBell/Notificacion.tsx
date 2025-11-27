'use client'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faUser, faUsers } from '@fortawesome/free-solid-svg-icons'
import styles from './NotificationBell.module.css'
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
    
    const {
        notificaciones,
        aceptarInvitacion: aceptarInvitacionContext,
        rechazarInvitacion: rechazarInvitacionContext,
        aceptarSolicitudAmistad,
        rechazarSolicitudAmistad,
        marcarComoLeida,
        isConnected
    } = useSignalR()

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

    useEffect(() => {
        if (!showPanel || !bellRef.current || !panelRef.current) return

        const updatePosition = () => {
            if (!bellRef.current || !panelRef.current) return

            const bellRect = bellRef.current.getBoundingClientRect()
            const panel = panelRef.current

            panel.style.top = `${bellRect.bottom + 10}px`
            panel.style.right = `${window.innerWidth - bellRect.right}px`
        }

        updatePosition()
        window.addEventListener('scroll', updatePosition, true)
        window.addEventListener('resize', updatePosition)

        return () => {
            window.removeEventListener('scroll', updatePosition, true)
            window.removeEventListener('resize', updatePosition)
        }
    }, [showPanel])

    const unreadCount = notificaciones.filter(n => !n.leida).length

    return (
        <>
            <div className={styles.contenedor} ref={bellRef}>
                <FontAwesomeIcon
                    icon={faBell}
                    className={`${styles.icono} ${isActive ? styles.icono_activo : ''}`}
                />

                {unreadCount > 0 && (
                    <span className={styles.badge}>{unreadCount}</span>
                )}
            </div>

            {mounted && showPanel && createPortal(
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
                        {!isConnected && (
                            <span style={{ 
                                fontSize: '0.75rem', 
                                color: '#ff6b6b', 
                                fontWeight: 'normal',
                                marginLeft: '8px'
                            }} title="Desconectado - Las notificaciones pueden no llegar en tiempo real">
                                ⚠️ Desconectado
                            </span>
                        )}
                    </h4>
                    <div className={styles.contenido}>
                        {notificaciones.length === 0 && (
                            <p>Sin notificaciones</p>
                        )}

                        {notificaciones.map(n => {
                            const isAmistad = n.tipo === 'solicitud_amistad'
                            const tipoNotifLower = n.tipoNotificacion?.toLowerCase() || ''
                            const tituloLower = n.titulo?.toLowerCase() || ''
                            const mensajeLower = n.mensaje?.toLowerCase() || ''
                            
                            const isGrupo = n.tipo === 'notificacion' && (
                                tipoNotifLower.includes('grupo') ||
                                tipoNotifLower.includes('invitacion') ||
                                tituloLower.includes('grupo') ||
                                tituloLower.includes('invitación') ||
                                tituloLower.includes('invitacion') ||
                                mensajeLower.includes('grupo') ||
                                mensajeLower.includes('invitación') ||
                                mensajeLower.includes('invitacion')
                            )
                            const hasActions = isAmistad || isGrupo

                            return (
                                <div
                                    key={n.id}
                                    onClick={() => marcarComoLeida(n.id)}
                                    className={`${styles.item} ${
                                        n.leida ? styles.leida : ''
                                    } ${hasActions ? styles.item_withActions : ''}`}
                                >
                                    <strong className={styles.titulo}>
                                        {n.titulo}
                                    </strong>

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

                                    {!isAmistad && !isGrupo && (
                                        <p className={styles.mensaje}>
                                            {n.mensaje}
                                        </p>
                                    )}

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
                </div>,
                document.body
            )}
        </>
    )
}
