/**
 * Tipos relacionados con funcionalidades sociales (amigos, invitaciones)
 */

import { UsuarioSimpleResponse } from './user'

export type Friend = {
    id: string
    nombre: string
    email: string
    username: string
    fotoPerfilUrl: string
}

export type FriendInvitation = {
    id: string
    remitente: Friend
    destinatario: Friend
    estado: 'Pendiente'
    fechaEnvio: string
    fechaRespuesta: null
    mensaje: null
}

export type SocialData = {
    friends: Friend[]
    friendsRequests: Friend[]
    groups: import('./group').Group[]
    groupsRequests: import('./group').Group[]
}

export type SolicitudAmistadResponse = {
    id: string
    remitente: UsuarioSimpleResponse
    destinatario: UsuarioSimpleResponse
    estado: string
    fechaEnvio: string
    fechaRespuesta?: string
    mensaje?: string
}

