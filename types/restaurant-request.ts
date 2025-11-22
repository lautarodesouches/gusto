/**
 * Tipos relacionados con solicitudes de restaurantes
 */

export interface SolicitudRestaurante {
    id: string
    nombreRestaurante: string
    direccion: string
    usuarioNombre: string
    usuarioEmail: string
    imgLogo?: string
    fechaCreacionUtc: string
    status?: SolicitudStatus
}

export type SolicitudStatus = 'Todos' | 'Pendiente' | 'Aceptado' | 'Rechazado'

// Tipos para respuestas del backend (PascalCase)
export interface SolicitudRestauranteBackend {
    Id?: string
    NombreRestaurante?: string
    Direccion?: string
    UsuarioNombre?: string
    UsuarioEmail?: string
    imgLogo?: string
    FechaCreacionUtc?: string
    Estado?: number | string
    EstadoSolicitudRestaurante?: number | string
}

export interface ItemSimpleBackend {
    Id?: string | number
    Nombre?: string
}

export interface DatosSolicitudRestauranteBackend {
    Gustos?: ItemSimpleBackend[]
    Restricciones?: ItemSimpleBackend[]
}

export interface HorarioSimpleDto {
    Dia: string
    Cerrado: boolean
    Desde?: string | null
    Hasta?: string | null
}

export interface SolicitudRestauranteDetalleBackend {
    Id?: string
    UsuarioId?: string
    UsuarioNombre?: string
    UsuarioEmail?: string
    NombreRestaurante?: string
    Direccion?: string
    Latitud?: number | null
    Longitud?: number | null
    PrimaryType?: string
    Types?: string[]
    HorariosJson?: string | null
    Gustos?: ItemSimpleBackend[]
    Restricciones?: ItemSimpleBackend[]
    ImagenesDestacadas?: string
    ImagenesInterior?: string[]
    ImagenesComida?: string[]
    ImagenMenu?: string | null
    Logo?: string | null
    FechaCreacionUtc?: string
    Horarios?: HorarioSimpleDto[]
    WebsiteUrl?: string | null
}

export interface SolicitudRestauranteDetalle {
    id: string
    usuarioId: string
    usuarioNombre: string
    usuarioEmail: string
    nombreRestaurante: string
    direccion: string
    latitud?: number | null
    longitud?: number | null
    primaryType: string
    types: string[]
    horariosJson?: string | null
    gustos: Array<{ id: string; nombre: string }>
    restricciones: Array<{ id: string; nombre: string }>
    imagenesDestacadas: string
    imagenesInterior: string[]
    imagenesComida: string[]
    imagenMenu?: string | null
    logo?: string | null
    fechaCreacionUtc: string
    horarios: Array<{
        dia: string
        cerrado: boolean
        desde?: string | null
        hasta?: string | null
    }>
    websiteUrl?: string | null
}

