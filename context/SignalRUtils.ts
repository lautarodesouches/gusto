import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr'
import { API_URL } from '@/constants'
import { SolicitudAmistadResponse } from '@/types'

// Re-export types if needed or define shared interfaces here
export interface Notificacion {
    id: string
    titulo: string
    mensaje: string
    tipo: string
    leida: boolean
    fechaCreacion: string
}

export interface UnifiedNotification {
    id: string
    tipo: 'notificacion' | 'solicitud_amistad'
    titulo: string
    mensaje: string
    leida: boolean
    fechaCreacion: string
    tipoNotificacion?: string
    solicitudAmistad?: SolicitudAmistadResponse
}

export function createHubConnection(hubPath: string, token: string | null): HubConnection {
    return new HubConnectionBuilder()
        .withUrl(`${API_URL}/${hubPath}`, {
            withCredentials: true,
            accessTokenFactory: () => {
                return token || ''
            }
        })
        .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: () => 3000
        })
        .configureLogging(LogLevel.Error)
        .build()
}

export function mergeNewNotifications(
    prev: UnifiedNotification[],
    data: Notificacion[]
): UnifiedNotification[] {
    // Procesar todas las notificaciones del backend (reemplazar, no solo agregar)
    const backendNotifs = data.map(n => ({
        id: n.id,
        tipo: 'notificacion' as const,
        titulo: n.titulo,
        mensaje: n.mensaje,
        leida: n.leida,
        fechaCreacion: n.fechaCreacion,
        tipoNotificacion: n.tipo,
    }))

    // Mantener las solicitudes de amistad que no vienen del backend
    const solicitudesAmistad = prev.filter(n => n.tipo === 'solicitud_amistad')

    // Combinar: notificaciones del backend + solicitudes de amistad
    return [...backendNotifs, ...solicitudesAmistad]
        .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
}

export function addSingleNotification(
    prev: UnifiedNotification[],
    notif: Notificacion
): UnifiedNotification[] {
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
}

export function mergeFriendRequests(
    prev: UnifiedNotification[],
    data: SolicitudAmistadResponse[]
): UnifiedNotification[] {
    // Procesar todas las solicitudes del backend (reemplazar, no solo agregar)
    const backendSolicitudes = data.map(s => ({
        id: s.id,
        tipo: 'solicitud_amistad' as const,
        titulo: 'Solicitud de amistad',
        mensaje: `${s.remitente.nombre} quiere ser tu amigo.`,
        leida: false,
        fechaCreacion: s.fechaEnvio,
        solicitudAmistad: s,
    }))

    // Mantener las notificaciones que no vienen del backend de solicitudes
    const notificaciones = prev.filter(n => n.tipo === 'notificacion')

    // Combinar: solicitudes del backend + notificaciones
    return [...backendSolicitudes, ...notificaciones]
        .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
}

export function addFriendRequest(
    prev: UnifiedNotification[],
    solicitud: SolicitudAmistadResponse
): UnifiedNotification[] {
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
}
