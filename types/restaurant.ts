/**
 * Tipos relacionados con restaurantes
 */

export type Restaurant = {
    id: string
    propietarioUid?: string
    horarios?: Record<string, unknown> // como viene vacío o puede ser JSON dinámico
    horariosJson?: string
    creadoUtc?: string // ISO date string
    actualizadoUtc?: string // ISO date string
    nombre: string
    direccion: string
    latitud: number
    longitud: number
    rating?: number
    valoracion?: number | null
    googlePlaceId?: string | null
    placeId?: string | null
    tipo?: string // si luego querés, podés hacer enum
    categoria?: string
    primaryType?: string
    imagenUrl?: string
    platos?: string[]
    gustosQueSirve?: Gusto[]
    restriccionesQueRespeta?: Restriccion[]
    score?: number
    reviews?: Review[]
    // Nuevos campos del RestauranteDetalleDto
    esDeLaApp: boolean
    webUrl?: string | null
    cantidadResenas?: number | null
    // Imágenes
    logoUrl?: string | null
    imagenDestacada?: string | null
    imagenesInterior: string[]
    imagenesComida: string[]
    // Menú OCR
    menu?: RestauranteMenu | null
    // Reviews separadas
    reviewsLocales: Review[]
    reviewsGoogle: Review[]
}

export type Review = {
    id: string
    autor: string
    rating: number
    texto: string
    fecha: string
    foto?: string
    restauranteId?: string

    userId?: string
    userName?: string
    userAvatar?: string
    title?: string
    content?: string
    images?: string[]
    isVerified?: boolean
    
    esImportada?: boolean
    fuenteExterna?: string
    fechaVisita?: string
    motivoVisita?: string
    mesAnioVisita?: string
    
    autorExterno?: string
    imagenAutorExterno?: string
    valoracion?: number
    opinion?: string
    fechaCreacion?: string
    titulo?: string
    usuarioId?: string
    usuario?: {
        nombre?: string
        username?: string
        fotoPerfilUrl?: string
    }
    fotos?: Array<{
        url?: string
        id?: string
    }>
}

export type Gusto = {
    id: string
    nombre: string
}

export type Restriccion = {
    id: string
    nombre: string
}

// Tipos para el menú OCR
export interface RestauranteMenu {
    nombreMenu: string
    moneda: string
    categorias: CategoriaMenu[]
}

export interface CategoriaMenu {
    nombre: string
    items: ItemMenu[]
}

export interface ItemMenu {
    nombre: string
    descripcion?: string | null
    precios: PrecioMenu[]
}

export interface PrecioMenu {
    tamaño: string
    monto: number
}

