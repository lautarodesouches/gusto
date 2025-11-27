'use client'
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { HubConnection } from '@microsoft/signalr'
import { SolicitudAmistadResponse } from '@/types'
import { useAuth } from './AuthContext'
import { 
  createHubConnection, 
  mergeNewNotifications, 
  addSingleNotification, 
  mergeFriendRequests, 
  addFriendRequest,
  UnifiedNotification,
  Notificacion
} from './SignalRUtils'

interface SignalRContextValue {
  notificaciones: UnifiedNotification[]
  notificacionesConnection: HubConnection | null
  solicitudesConnection: HubConnection | null
  aceptarInvitacion: (id: string) => Promise<void>
  rechazarInvitacion: (id: string) => Promise<void>
  aceptarSolicitudAmistad: (id: string) => Promise<void>
  rechazarSolicitudAmistad: (id: string) => Promise<void>
  marcarComoLeida: (id: string) => Promise<void>
  isConnected: boolean
}

const SignalRContext = createContext<SignalRContextValue | undefined>(undefined)

export function useSignalR() {
  const context = useContext(SignalRContext)
  if (!context) {
    throw new Error('useSignalR debe usarse dentro de SignalRProvider')
  }
  return context
}

interface SignalRProviderProps {
  children: ReactNode
}

export function SignalRProvider({ children }: SignalRProviderProps) {
  const { token } = useAuth()
  const [notificacionesConnection, setNotificacionesConnection] = useState<HubConnection | null>(null)
  const [solicitudesConnection, setSolicitudesConnection] = useState<HubConnection | null>(null)
  const [notificaciones, setNotificaciones] = useState<UnifiedNotification[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!token) return

    let conn: HubConnection | null = null
    let isMounted = true

    const connectNotificaciones = async () => {
      try {
        conn = createHubConnection('notificacionesHub', token)

        conn.on('CargarNotificaciones', (data: Notificacion[]) => {
          if (!isMounted) return
          setNotificaciones(prev => mergeNewNotifications(prev, data))
        })

        conn.on('RecibirNotificacion', (notif: Notificacion) => {
          if (!isMounted) return
          setNotificaciones(prev => addSingleNotification(prev, notif))
        })

        conn.on('NotificacionEliminada', (id: string) => {
          if (!isMounted) return
          setNotificaciones(prev => prev.filter(n => n.id !== id))
        })

        conn.onreconnecting(() => setIsConnected(false))
        conn.onreconnected(() => setIsConnected(true))
        conn.onclose(() => setIsConnected(false))

        await conn.start()
        if (isMounted) {
          setNotificacionesConnection(conn)
          setIsConnected(true)
        }
      } catch (err) {
        console.error('❌ Error conectando con NotificacionesHub:', err)
        setIsConnected(false)
      }
    }

    connectNotificaciones()

    return () => {
      isMounted = false
      if (conn) {
        conn.stop()
      }
    }
  }, [token])

  useEffect(() => {
    if (!token) return

    let conn: HubConnection | null = null
    let isMounted = true

    const connectSolicitudes = async () => {
      try {
        conn = createHubConnection('solicitudesAmistadHub', token)

        conn.on('SolicitudesPendientes', (data: SolicitudAmistadResponse[]) => {
          if (!isMounted) return
          setNotificaciones(prev => mergeFriendRequests(prev, data))
        })

        conn.on('RecibirSolicitudAmistad', (solicitud: SolicitudAmistadResponse) => {
          if (!isMounted) return
          setNotificaciones(prev => addFriendRequest(prev, solicitud))
        })

        conn.on('SolicitudEliminada', (id: string) => {
          if (!isMounted) return
          setNotificaciones(prev => prev.filter(n => n.id !== id))
        })

        await conn.start()
        if (isMounted) {
          setSolicitudesConnection(conn)
        }
      } catch (err) {
        console.error('❌ Error conectando con SolicitudesAmistadHub:', err)
      }
    }

    connectSolicitudes()

    return () => {
      isMounted = false
      if (conn) {
        conn.stop()
      }
    }
  }, [token])

  const aceptarInvitacion = useCallback(async (id: string) => {
    if (!notificacionesConnection) {
      throw new Error('No hay conexión con NotificacionesHub')
    }
    await notificacionesConnection.invoke('AceptarInvitacion', id)
    setNotificaciones(prev => prev.filter(n => n.id !== id))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('groups:refresh'))
    }
  }, [notificacionesConnection])

  const rechazarInvitacion = useCallback(async (id: string) => {
    if (!notificacionesConnection) {
      throw new Error('No hay conexión con NotificacionesHub')
    }
    await notificacionesConnection.invoke('RechazarInvitacion', id)
    setNotificaciones(prev => prev.filter(n => n.id !== id))
  }, [notificacionesConnection])

  const aceptarSolicitudAmistad = useCallback(async (id: string) => {
    if (!solicitudesConnection) {
      throw new Error('No hay conexión con SolicitudesAmistadHub')
    }
    await solicitudesConnection.invoke('AceptarSolicitud', id)
    setNotificaciones(prev => prev.filter(n => n.id !== id))
  }, [solicitudesConnection])

  const rechazarSolicitudAmistad = useCallback(async (id: string) => {
    if (!solicitudesConnection) {
      throw new Error('No hay conexión con SolicitudesAmistadHub')
    }
    await solicitudesConnection.invoke('RechazarSolicitud', id)
    setNotificaciones(prev => prev.filter(n => n.id !== id))
  }, [solicitudesConnection])

  const marcarComoLeida = useCallback(async (id: string) => {
    if (!notificacionesConnection) {
      throw new Error('No hay conexión con NotificacionesHub')
    }
    await notificacionesConnection.invoke('MarcarComoLeida', id)
    setNotificaciones(prev => prev.map(n => 
      n.id === id ? { ...n, leida: true } : n
    ))
  }, [notificacionesConnection])

  const value: SignalRContextValue = {
    notificaciones,
    notificacionesConnection,
    solicitudesConnection,
    aceptarInvitacion,
    rechazarInvitacion,
    aceptarSolicitudAmistad,
    rechazarSolicitudAmistad,
    marcarComoLeida,
    isConnected,
  }

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  )
}