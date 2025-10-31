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
  fecha: string
  leida: boolean
}

export default function NotificationBell() {
  const [connection, setConnection] = useState<HubConnection | null>(null)
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [showPanel, setShowPanel] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)


  useEffect(() => {
  const connect = async () => {
    try {
      const conn = new HubConnectionBuilder()
        .withUrl('http://localhost:5174/notificacionesHub', {
          withCredentials: true,
        })
        .withAutomaticReconnect()
        .build()

      conn.on('CargarNotificaciones', (data: Notificacion[]) => {
      console.log('🔁 Notificaciones iniciales:', data)
      setNotificaciones(data)
    })

      conn.on('ReceiveNotification', (notif: Notificacion) => {
        console.log('🔔 Nueva notificación:', notif)
        setNotificaciones(prev => [notif, ...prev])
      })

      await conn.start()
      console.log(' Conectado a NotificationHub')
      
      
      setConnection(conn)
    } catch (err) {
      console.error(' Error conectando con NotificationHub:', err)
    }
  }

  connect()

  // cleanup
  return () => {
    if (connection) {
      connection.stop()
      console.log(' Conexión cerrada')
    }
  }
}, [])


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowPanel(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notificaciones.filter(n => !n.leida).length

  const marcarComoLeida = (id: string) => {
    setNotificaciones(prev =>
      prev.map(n => (n.id === id ? { ...n, leida: true } : n))
    )
  }

  return (
    <div className={styles.container}>
      <FontAwesomeIcon
        icon={faBell}
        className={styles.icon}
        onClick={() => setShowPanel(!showPanel)}
      />

      {unreadCount > 0 && (
        <span className={styles.badge}>{unreadCount}</span>
      )}
{showPanel &&
  createPortal(
    <div className={styles.panel} ref={panelRef}>
      <h4>Notificaciones</h4>
      {notificaciones.length === 0 && <p>Sin notificaciones</p>}
      {notificaciones.map(n => (
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
            {new Date(n.fecha).toLocaleTimeString()}
          </small>
        </div>
      ))}
    </div>,
    document.body 
  )}
    </div>
  )
}