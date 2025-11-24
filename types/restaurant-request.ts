export type SolicitudStatus = 'Pendiente' | 'Aceptado' | 'Rechazado'

export interface SolicitudRestaurante {
    id: string
    usuarioId: string
    nombreRestaurante: string
    direccion: string
    estado: SolicitudStatus
    fechaCreacionUtc: string

    // Frontend specific fields or extended fields
    status?: SolicitudStatus
    imgLogo?: string
    usuarioNombre?: string
    usuarioEmail?: string
}

export interface ItemSimpleBackend {
    id: string
    nombre: string
}

export interface HorarioSimpleDto {
    dia: string
    cerrado: boolean
    desde?: string | null
    hasta?: string | null
}

export interface DatosSolicitudRestauranteBackend {
    nombre: string
    direccion: string
    latitud?: number
    longitud?: number
    websiteUrl?: string
    googlePlaceId?: string
    primaryType?: string
    types: string[]
    horarios: HorarioSimpleDto[]
    gustos: ItemSimpleBackend[]
    restricciones: ItemSimpleBackend[]
    logo?: string
    imagenesDestacadas?: string
    imagenesInterior: string[]
    imagenesComida: string[]
    imagenMenu?: string
}

export interface SolicitudRestauranteBackend {
    id: string
    usuarioId: string
    estado: SolicitudStatus
    fechaCreacionUtc: string
    datos: DatosSolicitudRestauranteBackend

    // Backend may use PascalCase
    Estado?: SolicitudStatus
    EstadoSolicitudRestaurante?: SolicitudStatus
}

export interface SolicitudRestauranteDetalleBackend {
    id: string
    usuarioId: string
    usuarioNombre: string
    usuarioEmail: string
    estado: SolicitudStatus
    fechaCreacionUtc: string
    datos: DatosSolicitudRestauranteBackend

    // Backend may also include these properties at the top level
    HorariosJson?: string
    Horarios?: HorarioSimpleDto[]
    ImagenMenu?: string
    Logo?: string
}

export interface SolicitudRestauranteDetalle {
    id: string
    usuarioId: string
    usuarioNombre: string
    usuarioEmail: string
    estado: SolicitudStatus
    fechaCreacionUtc: string

    // Flattened data for frontend
    nombreRestaurante: string
    direccion: string
    latitud?: number
    longitud?: number
    websiteUrl?: string
    primaryType?: string
    types: string[]
    horarios: HorarioSimpleDto[]
    gustos: ItemSimpleBackend[]
    restricciones: ItemSimpleBackend[]

    logo?: string
    imagenesDestacadas?: string
    imagenesInterior: string[]
    imagenesComida: string[]
    imagenMenu?: string
}
