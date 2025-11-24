export type EstadoVotacion = 'ABIERTA' | 'CERRADA'

export interface Votacion {
    id: string
    grupoId: string
    fechaCreacionUtc: string
    estado: EstadoVotacion
    creadorId: string
    restauranteGanadorId?: string
    votacionId?: string // For compatibility with some backend responses
}

export interface Voto {
    id: string
    votacionId: string
    usuarioId: string
    restauranteId: string
    fechaVotoUtc: string
    comentario?: string
}

export interface VotanteInfo {
    usuarioId: string
    usuarioNombre: string
    usuarioFoto?: string
    comentario?: string
}

export interface RestauranteVotado {
    restauranteId: string
    restauranteNombre: string
    restauranteDireccion: string
    cantidadVotos: number
    votantes: VotanteInfo[]
}

export interface ResultadoVotacion {
    votacionId: string
    grupoId: string
    estado: EstadoVotacion
    totalVotos: number
    miembrosActivos: number
    todosVotaron: boolean
    ganadorId?: string
    hayEmpate: boolean
    restaurantesEmpatados: string[]
    restaurantesVotados: RestauranteVotado[]
}

export interface IniciarVotacionRequest {
    grupoId: string
}

export interface RegistrarVotoRequest {
    restauranteId: string
    comentario?: string
}
