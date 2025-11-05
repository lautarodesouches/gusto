'use client'
import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserFriends, faUser } from '@fortawesome/free-solid-svg-icons'
import styles from './FriendRequests.module.css'
import { API_URL } from '@/constants'
import { useToast } from '@/context/ToastContext'
import { SolicitudAmistadResponse } from '@/types'

export default function FriendRequests() {
    const [connection, setConnection] = useState<HubConnection | null>(null)
    const [solicitudes, setSolicitudes] = useState<SolicitudAmistadResponse[]>([])
    const [showPanel, setShowPanel] = useState(false)
    const panelRef = useRef<HTMLDivElement | null>(null)
    const toast = useToast()

    // Conexión con el Hub de SignalR
    useEffect(() => {
        const connect = async () => {
            try {
                const conn = new HubConnectionBuilder()
                    .withUrl(`${API_URL}/solicitudesAmistadHub`, {
                        withCredentials: true,
                    })
                    .withAutomaticReconnect()
                    .build()

         

                // Cargar solicitudes pendientes al conectar
                conn.on('SolicitudesPendientes', (data: SolicitudAmistadResponse[]) => {
                    console.log('🔁 Solicitudes pendientes:', data)
                    setSolicitudes(data)
                })


                // Nueva solicitud recibida en tiempo real
                conn.on('RecibirSolicitudAmistad', (solicitud: SolicitudAmistadResponse) => {
                    console.log('📩 Nueva solicitud recibida:', solicitud)
                    setSolicitudes(prev => {
                        const exists = prev.some(s => s.id === solicitud.id)
                        return exists ? prev : [solicitud, ...prev]
                    })
                })

                // Solicitud eliminada (aceptada/rechazada)
                conn.on('SolicitudEliminada', (id: string) => {
                    console.log('🗑️ Solicitud eliminada:', id)
                    setSolicitudes(prev => prev.filter(s => s.id !== id))
                })

                await conn.start()
                console.log('✅ Conectado a SolicitudesAmistadHub')
                setConnection(conn)
            } catch (err) {
                console.error('❌ Error conectando con SolicitudesAmistadHub:', err)
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

    // Cerrar panel si se hace click fuera de él
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(event.target as Node)
            ) {
                setShowPanel(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () =>
            document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Acciones disponibles
    const aceptarSolicitud = async (solicitudId: string) => {
        try {
            // Convertir string a GUID si es necesario
            await connection?.invoke('AceptarSolicitud', solicitudId)
            toast.success('Solicitud de amistad aceptada')
            setSolicitudes(prev => prev.filter(s => s.id !== solicitudId))
            
            // Refrescar lista de amigos
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('friends:refresh'))
            }
            
            setShowPanel(false)
        } catch (err) {
            console.error('❌ Error aceptando solicitud:', err)
            toast.error('No se pudo aceptar la solicitud')
        }
    }

    const rechazarSolicitud = async (solicitudId: string) => {
        try {
            await connection?.invoke('RechazarSolicitud', solicitudId)
            toast.info('Solicitud de amistad rechazada')
            setSolicitudes(prev => prev.filter(s => s.id !== solicitudId))
            setShowPanel(false)
        } catch (err) {
            console.error('❌ Error rechazando solicitud:', err)
            toast.error('No se pudo rechazar la solicitud')
        }
    }

    const pendingCount = solicitudes.length

    // 🔹 Render
    return (
        <div className={styles.container}>
            <FontAwesomeIcon
                icon={faUserFriends}
                className={styles.icon}
                onClick={() => setShowPanel(!showPanel)}
            />

            {pendingCount > 0 && (
                <span className={styles.badge}>{pendingCount}</span>
            )}

            {showPanel &&
                createPortal(
                    <div className={styles.panel} ref={panelRef}>
                        <h4>Solicitudes de amistad</h4>
                        {solicitudes.length === 0 && (
                            <p>No tienes solicitudes pendientes</p>
                        )}

                        {solicitudes.map(solicitud => {
                            return (
                                <div
                                    key={solicitud.id}
                                    className={styles.requestItem}
                                >
                                    <div className={styles.requestHeader}>
                                        <div className={styles.userInfo}>
                                            <div className={styles.userAvatar}>
                                                {solicitud.remitente.fotoPerfilUrl ? (
                                                    <img
                                                        src={solicitud.remitente.fotoPerfilUrl}
                                                        alt={solicitud.remitente.nombre}
                                                        className={styles.avatarImg}
                                                    />
                                                ) : (
                                                    <FontAwesomeIcon
                                                        icon={faUser}
                                                        className={styles.avatarPlaceholder}
                                                    />
                                                )}
                                            </div>
                                            <div className={styles.userDetails}>
                                                <strong className={styles.userName}>
                                                    {solicitud.remitente.nombre}
                                                </strong>
                                                <p className={styles.userUsername}>
                                                    @{solicitud.remitente.username}
                                                </p>
                                                <p className={styles.message}>
                                                    {solicitud.remitente.nombre} quiere ser tu amigo.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <small className={styles.time}>
                                        {new Date(
                                            solicitud.fechaEnvio
                                        ).toLocaleString('es-AR', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            day: '2-digit',
                                            month: '2-digit',
                                        })}
                                    </small>

                                    <div className={styles.actions}>
                                        <button
                                            onClick={e => {
                                                e.stopPropagation()
                                                aceptarSolicitud(solicitud.id)
                                            }}
                                            className={styles.accept}
                                        >
                                            Aceptar
                                        </button>
                                        <button
                                            onClick={e => {
                                                e.stopPropagation()
                                                rechazarSolicitud(solicitud.id)
                                            }}
                                            className={styles.reject}
                                        >
                                            Rechazar
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>,
                    document.body
                )}
        </div>
    )
}

