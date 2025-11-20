/**
 * Tipos relacionados con grupos
 */

export type Group = {
    activo: boolean
    administradorFirebaseUid: string
    administradorId: string
    administradorNombre: string
    cantidadMiembros: number
    codigoInvitacion: string
    descripcion: string
    fechaCreacion: string
    fechaExpiracionCodigo: string
    id: string
    miembros: GroupMember[]
    nombre: string
}

export type GroupMember = {
    id: string
    usuarioId: string
    usuarioFirebaseUid: string
    usuarioNombre: string
    usuarioEmail: string
    usuarioUsername: string
    fechaUnion: string
    esAdministrador: boolean
    fotoPerfilUrl?: string
}

