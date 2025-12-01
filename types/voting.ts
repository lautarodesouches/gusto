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
    firebaseUid?: string // Firebase UID del usuario (camelCase)
    FirebaseUid?: string // Firebase UID del usuario (PascalCase - como el backend lo envía)
    usuarioNombre: string
    usuarioFoto?: string
    comentario?: string
}

export interface RestauranteCandidato {
    restauranteId: string
    nombre: string
    direccion: string
    imagenUrl?: string
}

export interface RestauranteVotado {
    restauranteId: string
    restauranteNombre: string
    restauranteDireccion: string
    restauranteImagenUrl?: string // Incluido en RestauranteVotadoDto del backend
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
    // Nuevos campos de la respuesta del GET /Votacion/grupo/{grupoId}/activa
    restaurantesCandidatos?: RestauranteCandidato[]
    fechaInicio?: string
    fechaCierre?: string | null
}

export interface IniciarVotacionRequest {
    grupoId: string
    restaurantesCandidatos: string[] // IDs de restaurantes
    descripcion?: string // Opcional según el backend
}

export interface RegistrarVotoRequest {
    restauranteId: string
    comentario?: string
}

// Respuesta del GET /Votacion/grupo/{grupoId}/activa
export interface VotacionActivaResponse {
    hayVotacionActiva: boolean
    soyAdministrador: boolean
    votacion: ResultadoVotacion | null
}
