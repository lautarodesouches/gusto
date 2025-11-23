/**
 * Tipos relacionados con votaciones de grupos
 */

export type EstadoVotacion = 'Activa' | 'Cerrada' | 'Cancelada'

export interface Votacion {
    id: string
    grupoId: string
    estado: EstadoVotacion
    fechaInicio: string
    fechaCierre?: string
    restauranteGanadorId?: string
    descripcion?: string
}

export interface Voto {
    id: string
    votacionId: string
    usuarioId: string
    restauranteId: string
    fechaVoto: string
    comentario?: string
}

export interface VotanteInfo {
    usuarioId: string
    usuarioNombre: string
    usuarioFoto: string
    comentario?: string
}

export interface RestauranteVotado {
    restauranteId: string
    restauranteNombre: string
    restauranteDireccion: string
    restauranteImagenUrl: string
    cantidadVotos: number
    votantes: VotanteInfo[]
}

export interface ResultadoVotacion {
    votacionId: string
    grupoId: string
    estado: EstadoVotacion
    todosVotaron: boolean
    miembrosActivos: number
    totalVotos: number
    restaurantesVotados: RestauranteVotado[]
    ganadorId?: string
    hayEmpate: boolean
    restaurantesEmpatados: string[]
    fechaInicio: string
    fechaCierre?: string
}

export interface IniciarVotacionRequest {
    grupoId: string
    descripcion?: string
}

export interface RegistrarVotoRequest {
    restauranteId: string
    comentario?: string
}


