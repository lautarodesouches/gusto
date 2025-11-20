/**
 * Tipos relacionados con perfiles de usuario
 */

export type UserResumen = {
    restricciones?: Array<{ id: string | number; nombre: string }>
    condicionesMedicas?: Array<{ id: string | number; nombre: string }>
    gustos?: Array<{ id: string | number; nombre: string }>
}

export type UpdateProfilePayload = {
    username?: string
    esPrivado?: boolean
    nombre?: string
    apellido?: string
    bio?: string
}

