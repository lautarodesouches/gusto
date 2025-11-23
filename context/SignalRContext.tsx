'use client'
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr'
import { API_URL } from '@/constants'
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
  tipoNotificacion?: string
  solicitudAmistad?: SolicitudAmistadResponse
}

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
  const [notificacionesConnection, setNotificacionesConnection] = useState<HubConnection | null>(null)
  const [solicitudesConnection, setSolicitudesConnection] = useState<HubConnection | null>(null)
  const [notificaciones, setNotificaciones] = useState<UnifiedNotification[]>([])
  const [isConnected, setIsConnected] = useState(false)


  useEffect(() => {
    let conn: HubConnection | null = null
    let isMounted = true

    const connectNotificaciones = async () => {
      try {
        conn = new HubConnectionBuilder()
          .withUrl(`${API_URL}/notificacionesHub`, {
            withCredentials: true,
          })
          .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: () => 3000
          })
          .build()

        conn.on('CargarNotificaciones', (data: Notificacion[]) => {
          if (!isMounted) return
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

        conn.on('RecibirNotificacion', (notif: Notificacion) => {
          if (!isMounted) return
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

        conn.on('NotificacionEliminada', (id: string) => {
          if (!isMounted) return
          setNotificaciones(prev => prev.filter(n => n.id !== id))
        })

        conn.onreconnecting(() => {
          setIsConnected(false)
        })

        conn.onreconnected(() => {
          setIsConnected(true)
        })

        conn.onclose(() => {
          setIsConnected(false)
        })

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
  }, [])

  useEffect(() => {
    let conn: HubConnection | null = null
    let isMounted = true

    const connectSolicitudes = async () => {
      try {
        conn = new HubConnectionBuilder()
          .withUrl(`${API_URL}/solicitudesAmistadHub`, {
            withCredentials: true,
          })
          .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: () => 3000
          })
          .build()

        conn.on('SolicitudesPendientes', (data: SolicitudAmistadResponse[]) => {
          if (!isMounted) return
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

        conn.on('RecibirSolicitudAmistad', (solicitud: SolicitudAmistadResponse) => {
          if (!isMounted) return
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

        conn.on('SolicitudEliminada', (id: string) => {
          if (!isMounted) return
          setNotificaciones(prev => prev.filter(n => n.id !== id))
        })

        conn.onreconnecting(() => {
        })

        conn.onreconnected(() => {
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
  }, [])

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
