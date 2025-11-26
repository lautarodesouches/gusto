import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr'
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

export function createHubConnection(hubPath: string): HubConnection {
    return new HubConnectionBuilder()
        .withUrl(`${API_URL}/${hubPath}`, {
            withCredentials: true,
        })
        .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: () => 3000
        })
        .build()
}

export function mergeNewNotifications(
    prev: UnifiedNotification[],
    data: Notificacion[]
): UnifiedNotification[] {
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
