import { Restaurant, Review } from '@/types'

interface RawRestaurant {
    id?: string | number
    Id?: string | number
    latitud?: number | string
    Latitud?: number | string
    longitud?: number | string
    Longitud?: number | string
    nombre?: string
    Nombre?: string
    direccion?: string
    Direccion?: string
    rating?: number
    Rating?: number
    valoracion?: number
    Valoracion?: number
    categoria?: string
    Categoria?: string
    imagenUrl?: string
    ImagenUrl?: string
    googlePlaceId?: string
    GooglePlaceId?: string
    placeId?: string
    PlaceId?: string
    imagenesInterior?: string[]
    imagenesComida?: string[]
    reviewsLocales?: Review[]
    reviewsGoogle?: Review[]
    recomendaciones?: unknown[]
}

export function normalizeResponse(data: unknown): unknown[] {
    if (!data) return []
    if (Array.isArray(data)) return data
    const obj = data as { recomendaciones?: unknown[] }
    return obj.recomendaciones || []
}

export function isValidRestaurant(r: unknown): boolean {
    const raw = r as RawRestaurant
    const lat = raw.latitud ?? raw.Latitud
    const lng = raw.longitud ?? raw.Longitud

    if (lat === undefined || lng === undefined) return false

    const latNum = typeof lat === 'number' ? lat : parseFloat(String(lat))
    const lngNum = typeof lng === 'number' ? lng : parseFloat(String(lng))

    // Validar que las coordenadas sean números válidos y estén en rangos geográficos
    const isValidLat = !isNaN(latNum) && latNum >= -90 && latNum <= 90
    const isValidLng = !isNaN(lngNum) && lngNum >= -180 && lngNum <= 180

    return isValidLat && isValidLng
}

export function mapToRestaurant(r: unknown): Restaurant | null {
    const raw = r as RawRestaurant
    const latVal = raw.latitud ?? raw.Latitud ?? 0
    const lngVal = raw.longitud ?? raw.Longitud ?? 0

    const lat = typeof latVal === 'number' ? latVal : parseFloat(String(latVal)) || 0
    const lng = typeof lngVal === 'number' ? lngVal : parseFloat(String(lngVal)) || 0

    // El backend envía GooglePlaceId (no PlaceId)
    const googlePlaceId = raw.googlePlaceId || raw.GooglePlaceId || ''
    const placeId = raw.placeId || raw.PlaceId || googlePlaceId

    // LÓGICA: Si NO tiene GooglePlaceId, entonces es de la app (sin importar EsDeLaApp del backend)
    // Si tiene GooglePlaceId, entonces NO es de la app
    // Esto corrige el caso donde el backend envía EsDeLaApp=false pero no tiene GooglePlaceId
    const tieneGooglePlaceId = googlePlaceId && googlePlaceId !== null && googlePlaceId !== '' && String(googlePlaceId).trim() !== ''
    const esDeLaApp = !tieneGooglePlaceId

    // Asegurar que el ID sea válido (no puede estar vacío)
    const rawId = raw.id || raw.Id
    if (!rawId || String(rawId).trim() === '') {
        console.warn('⚠️ Restaurante sin ID válido omitido:', {
            nombre: raw.nombre || raw.Nombre,
            datos: raw
        })
        return null
    }

    return {
        id: String(rawId),
        nombre: String(raw.nombre || raw.Nombre || 'Sin nombre'),
        direccion: String(raw.direccion || raw.Direccion || ''),
        latitud: lat,
        longitud: lng,
        rating: (raw.rating ?? raw.Rating ?? raw.valoracion ?? raw.Valoracion) as number | undefined,
        categoria: (raw.categoria || raw.Categoria || undefined) as string | undefined,
        imagenUrl: (raw.imagenUrl || raw.ImagenUrl || undefined) as string | undefined,
        esDeLaApp: esDeLaApp,
        placeId: (placeId ? String(placeId) : null) as string | null,
        googlePlaceId: (googlePlaceId ? String(googlePlaceId) : null) as string | null,
        imagenesInterior: Array.isArray(raw.imagenesInterior) ? raw.imagenesInterior : [],
        imagenesComida: Array.isArray(raw.imagenesComida) ? raw.imagenesComida : [],
        reviewsLocales: Array.isArray(raw.reviewsLocales) ? raw.reviewsLocales : [],
        reviewsGoogle: Array.isArray(raw.reviewsGoogle) ? raw.reviewsGoogle : [],
    }
}
