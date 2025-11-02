'use client'

import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/free-solid-svg-icons'
import styles from './NotificationBell.module.css'

interface Notificacion {
  id: string
  titulo: string
  mensaje: string
  tipo: string
  leida: boolean
  fechaCreacion: string
}

export default function NotificationBell() {
  const [connection, setConnection] = useState<HubConnection | null>(null)
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [showPanel, setShowPanel] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)

  // Conexión con el Hub de SignalR
  useEffect(() => {
    const connect = async () => {
      try {
        const conn = new HubConnectionBuilder()
          .withUrl('http://localhost:5174/notificacionesHub', {
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

  //  Cerrar panel si se hace click fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowPanel(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  //  Acciones disponibles
  const aceptarInvitacion = async (id: string) => {
    try {
      await connection?.invoke('AceptarInvitacion', id)
    } catch (err) {
      console.error('❌ Error aceptando invitación:', err)
    }
  }

  const rechazarInvitacion = async (id: string) => {
    try {
      await connection?.invoke('RechazarInvitacion', id)
    } catch (err) {
      console.error('❌ Error rechazando invitación:', err)
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
    <div className={styles.container}>
      <FontAwesomeIcon
        icon={faBell}
        className={styles.icon}
        onClick={() => setShowPanel(!showPanel)}
      />

      {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}

      {showPanel &&
        createPortal(
          <div className={styles.panel} ref={panelRef}>
            <h4>Notificaciones</h4>
            {notificaciones.length === 0 && <p>Sin notificaciones</p>}

            {}
            {notificaciones.map(n => {
              return (
                <div
                  key={n.id}
                  onClick={() => marcarComoLeida(n.id)}
                  className={`${styles.notificationItem} ${
                    n.leida ? styles.read : ''
                  }`}
                >
                  <strong className={styles.title}>{n.titulo}</strong>
                  <p className={styles.message}>{n.mensaje}</p>

                 <small className={styles.time}>
                 {new Date(n.fechaCreacion).toLocaleString('es-AR', {
                 hour: '2-digit',
                  minute: '2-digit',
                    day: '2-digit',
                  month: '2-digit',
                   })}
                  </small>


                  {/* Botones solo para invitaciones de grupo */}
                  {n.tipo === 'InvitacionGrupo' && (
                    <div className={styles.actions}>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          aceptarInvitacion(n.id)
                        }}
                        className={styles.accept}
                      >
                        ✅ Aceptar
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          rechazarInvitacion(n.id)
                        }}
                        className={styles.reject}
                      >
                        ❌ Rechazar
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>,
          document.body
        )}
    </div>
  )
}
