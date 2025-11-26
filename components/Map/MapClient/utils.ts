import { Restaurant } from '@/types'

export function normalizeResponse(data: any): any[] {
    if (!data) return []
    return Array.isArray(data) ? data : (data.recomendaciones || [])
}

export function isValidRestaurant(r: any): boolean {
    const lat = r.latitud ?? r.Latitud
    const lng = r.longitud ?? r.Longitud

    // Validar que las coordenadas sean números válidos y estén en rangos geográficos
    const isValidLat = typeof lat === 'number' && !isNaN(lat) && lat >= -90 && lat <= 90
    const isValidLng = typeof lng === 'number' && !isNaN(lng) && lng >= -180 && lng <= 180

    return isValidLat && isValidLng
}

export function mapToRestaurant(r: any): Restaurant | null {
    const lat = r.latitud ?? r.Latitud ?? 0
    const lng = r.longitud ?? r.Longitud ?? 0

    // El backend envía GooglePlaceId (no PlaceId)
    const googlePlaceId = r.googlePlaceId || r.GooglePlaceId || ''
    const placeId = r.placeId || r.PlaceId || googlePlaceId

    // LÓGICA: Si NO tiene GooglePlaceId, entonces es de la app (sin importar EsDeLaApp del backend)
    // Si tiene GooglePlaceId, entonces NO es de la app
    // Esto corrige el caso donde el backend envía EsDeLaApp=false pero no tiene GooglePlaceId
    const tieneGooglePlaceId = googlePlaceId && googlePlaceId !== null && googlePlaceId !== '' && String(googlePlaceId).trim() !== ''
    const esDeLaApp = !tieneGooglePlaceId

    // Asegurar que el ID sea válido (no puede estar vacío)
    const rawId = r.id || r.Id
    if (!rawId || String(rawId).trim() === '') {
        console.warn('⚠️ Restaurante sin ID válido omitido:', {
            nombre: r.nombre || r.Nombre,
            datos: r
        })
        return null
    }

    return {
        id: String(rawId),
        nombre: String(r.nombre || r.Nombre || 'Sin nombre'),
        direccion: String(r.direccion || r.Direccion || ''),
        latitud: typeof lat === 'number' ? lat : parseFloat(String(lat)) || 0,
        longitud: typeof lng === 'number' ? lng : parseFloat(String(lng)) || 0,
        rating: (r.rating ?? r.Rating ?? r.valoracion ?? r.Valoracion) as number | undefined,
        categoria: (r.categoria || r.Categoria || undefined) as string | undefined,
        imagenUrl: (r.imagenUrl || r.ImagenUrl || undefined) as string | undefined,
        esDeLaApp: esDeLaApp,
        placeId: (placeId ? String(placeId) : null) as string | null,
        googlePlaceId: (googlePlaceId ? String(googlePlaceId) : null) as string | null,
        imagenesInterior: Array.isArray(r.imagenesInterior) ? r.imagenesInterior : [],
        imagenesComida: Array.isArray(r.imagenesComida) ? r.imagenesComida : [],
        reviewsLocales: Array.isArray(r.reviewsLocales) ? r.reviewsLocales : [],
        reviewsGoogle: Array.isArray(r.reviewsGoogle) ? r.reviewsGoogle : [],
    }
}
