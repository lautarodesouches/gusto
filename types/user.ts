/**
 * Tipos relacionados con usuarios
 */

export type User = {
    nombre: string
    apellido: string
    username: string
    fotoPerfilUrl: string
    esPrivado: boolean
    plan: 'Free' | 'Plus'
    esPremium: boolean
    esMiPerfil: boolean
    esAmigo: boolean
    gustos: {
        id: string
        nombre: string
    }[]
    visitados: {
        id: number
        nombre: string
        lat: number
        lng: number
    }[]
}

export type UsuarioSimpleResponse = {
    id: string
    nombre: string
    username: string
    email: string
    fotoPerfilUrl: string
}

