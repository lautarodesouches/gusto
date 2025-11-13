'use client'
import { useEffect, useState, useRef } from 'react'
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/free-solid-svg-icons'
import styles from './NotificationBell.module.css'
import { API_URL } from '@/constants'
import { useToast } from '@/context/ToastContext'

interface Notificacion {
    id: string
    titulo: string
    mensaje: string
    tipo: string
    leida: boolean
    fechaCreacion: string
}

interface NotificationBellProps {
    showPanel?: boolean
    isActive?: boolean
}

export default function NotificationBell({ showPanel = false, isActive = false }: NotificationBellProps) {
    const [connection, setConnection] = useState<HubConnection | null>(null)
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
    const panelRef = useRef<HTMLDivElement | null>(null)
    const toast = useToast()

    // Conexión con el Hub de SignalR
    useEffect(() => {
        const connect = async () => {
            try {
                const conn = new HubConnectionBuilder()
                    .withUrl(`${API_URL}/notificacionesHub`, {
                        withCredentials: true,
                    })
                    .withAutomaticReconnect()
                    .build()

                //  Cargar notificaciones iniciales al conectar
                conn.on('CargarNotificaciones', (data: Notificacion[]) => {
                    console.log('🔁 Notificaciones iniciales:', data)
                    setNotificaciones(data)
                })

                //  Nueva notificación recibida en tiempo real
                conn.on('RecibirNotificacion', (notif: Notificacion) => {
                    setNotificaciones(prev => {
                        const exists = prev.some(n => n.id === notif.id)
                        return exists ? prev : [notif, ...prev]
                    })
                })

                //  Eliminar notificación si el servidor lo indica
                conn.on('NotificacionEliminada', (id: string) => {
                    console.log('🗑️ Notificación eliminada:', id)
                    setNotificaciones(prev => prev.filter(n => n.id !== id))
                })

                await conn.start()
                console.log('✅ Conectado a NotificationHub')
                setConnection(conn)
            } catch (err) {
                console.error('❌ Error conectando con NotificationHub:', err)
            }
        }

        connect()

        return () => {
            if (connection) {
                connection.stop()
                console.log('🔴 Conexión cerrada')
            }
        }
    }, [])

    // Ya no necesitamos cerrar el panel aquí, lo maneja ProfileBar

    //  Acciones disponibles
    const aceptarInvitacion = async (id: string) => {
        try {
            await connection?.invoke('AceptarInvitacion', id)
            toast.success('Invitación al grupo aceptada')
            setNotificaciones(prev => prev.filter(n => n.id !== id))
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('groups:refresh'))
            }
        } catch (err) {
            console.error('❌ Error aceptando invitación:', err)
            toast.error('No se pudo aceptar la invitación')
        }
    }

    const rechazarInvitacion = async (id: string) => {
        try {
            await connection?.invoke('RechazarInvitacion', id)
            toast.info('Invitación al grupo rechazada')
            setNotificaciones(prev => prev.filter(n => n.id !== id))
        } catch (err) {
            console.error('❌ Error rechazando invitación:', err)
            toast.error('No se pudo rechazar la invitación')
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
        <div className={styles.contenedor}>
            <FontAwesomeIcon
                icon={faBell}
                className={`${styles.icono} ${isActive ? styles.icono_activo : ''}`}
            />

            {unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount}</span>
            )}

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
                            return (
                                <div
                                    key={n.id}
                                    onClick={() => marcarComoLeida(n.id)}
                                    className={`${styles.item} ${
                                        n.leida ? styles.leida : ''
                                    }`}
                                >
                                    <strong className={styles.titulo}>
                                        {n.titulo}
                                    </strong>
                                    <p className={styles.mensaje}>
                                        {n.mensaje}
                                    </p>

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

                                    {/* Botones solo para invitaciones de grupo */}
                                    {n.tipo === 'InvitacionGrupo' && (
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
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
