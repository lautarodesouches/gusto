'use server'
import { API_URL } from '@/constants'
import { ApiResponse, Restaurant, Review, RestauranteMetricasDashboard } from '@/types'
import { cookies } from 'next/headers'

async function getAuthHeaders(): Promise<HeadersInit> {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    }
}

// Helper para mapear una review del backend
interface ReviewBackend {
    id?: string
    autorExterno?: string
    autor?: string
    imagenAutorExterno?: string
    imagenAutor?: string
    valoracion?: number
    rating?: number
    opinion?: string
    texto?: string
    fechaCreacion?: string
    fecha?: string
    restauranteId?: string
    usuarioId?: string
    userId?: string
    titulo?: string
    title?: string
    content?: string
    esImportada?: boolean
    fuenteExterna?: string
    fechaVisita?: string
    motivoVisita?: string
    mesAnioVisita?: string
    fotos?: Array<string | { url?: string; Url?: string }>
    Fotos?: Array<string | { url?: string; Url?: string }>
    usuario?: {
        nombre?: string
        username?: string
        fotoPerfilUrl?: string
    }
}

function mapReview(review: ReviewBackend, restaurantId: string): Review {
    const autor = review.autorExterno ||
        review.autor ||
        review.usuario?.nombre ||
        review.usuario?.username ||
        'Anónimo'

    const foto = review.imagenAutorExterno ||
        review.imagenAutor ||
        review.usuario?.fotoPerfilUrl ||
        ''

    // Mapear fotos - puede venir como array de objetos {url} o como array de strings
    const fotos = review.fotos || review.Fotos || []
    const images = Array.isArray(fotos)
        ? fotos.map((f) => {
            // Si es un string, usarlo directamente
            if (typeof f === 'string') return f
            // Si es un objeto, usar la propiedad url
            const fotoObj = f as { url?: string; Url?: string }
            return fotoObj?.url || fotoObj?.Url || ''
        }).filter((url: string) => url)
        : []

    return {
        id: review.id || '',
        autor: autor,
        rating: review.valoracion || review.rating || 0,
        texto: review.opinion || review.texto || '',
        fecha: review.fechaCreacion || review.fecha || review.fechaCreacion || '',
        foto: foto,
        restauranteId: review.restauranteId || restaurantId,
        userId: review.usuarioId || review.userId,
        userName: autor,
        userAvatar: foto,
        title: review.titulo || review.title,
        content: review.opinion || review.content || '',
        images: images,
        isVerified: !review.esImportada,
        esImportada: review.esImportada || false,
        fuenteExterna: review.fuenteExterna,
        fechaVisita: review.fechaVisita,
        motivoVisita: review.motivoVisita,
        mesAnioVisita: review.mesAnioVisita,
    }
}

export async function getRestaurant(
    id: string
): Promise<ApiResponse<Restaurant>> {
    try {
        const res = await fetch(`${API_URL}/api/Restaurantes/${id}`, {
            headers: await getAuthHeaders(),
            cache: 'no-store',
        })

        if (!res.ok) {
            return {
                success: false,
                error: 'Restaurante no encontrado',
            }
        }

        const data = await res.json()

        // Mapear el restaurante con los nuevos campos
        const restaurant: Restaurant = {
            id: data.id || data.Id || '',
            nombre: data.nombre || data.Nombre || '',
            direccion: data.direccion || data.Direccion || '',
            // Usar nullish coalescing para no tratar 0 como falsy
            // Validar que los valores estén en rangos válidos antes de asignar
            latitud: (() => {
                const lat = data.latitud ?? data.Latitud
                // Validar que esté en rango válido (-90 a 90)
                if (lat != null && !isNaN(lat) && lat >= -90 && lat <= 90) {
                    return lat
                }
                console.warn('⚠️ Latitud inválida recibida del backend:', lat)
                return 0
            })(),
            longitud: (() => {
                const lng = data.longitud ?? data.Longitud
                // Validar que esté en rango válido (-180 a 180)
                if (lng != null && !isNaN(lng) && lng >= -180 && lng <= 180) {
                    return lng
                }
                console.warn('⚠️ Longitud inválida recibida del backend:', lng)
                return 0
            })(),
            // Usar RatingCalculado del backend (calculado automáticamente)
            rating: data.ratingCalculado || data.RatingCalculado || data.rating || data.Rating || data.valoracion || data.Valoracion || null,
            valoracion: data.valoracion || data.Valoracion || data.ratingCalculado || data.RatingCalculado || data.rating || data.Rating || null,
            googlePlaceId: data.googlePlaceId || data.GooglePlaceId || data.placeId || data.PlaceId || null,
            placeId: data.placeId || data.PlaceId || data.googlePlaceId || data.GooglePlaceId || null,
            tipo: data.tipo || data.Tipo || data.primaryType || data.PrimaryType || 'restaurant',
            primaryType: data.primaryType || data.PrimaryType || data.tipo || data.Tipo || 'restaurant',
            categoria: data.categoria || data.Categoria || null,
            webUrl: data.webUrl || data.WebUrl || null,
            cantidadResenas: data.cantidadResenas || data.CantidadResenas || null,
            horariosJson: data.horariosJson || data.HorariosJson || '{}',
            horarios: data.horariosJson || data.HorariosJson ? JSON.parse(data.horariosJson || data.HorariosJson || '{}') : {},

            // Nuevos campos
            esDeLaApp: data.esDeLaApp ?? data.EsDeLaApp ?? false,
            logoUrl: data.logoUrl || data.LogoUrl || null,
            // imagenDestacada viene del backend (Tipo 0)
            imagenDestacada: data.imagenDestacada || data.ImagenDestacada || null,
            // imagenUrl - este es el campo principal que viene del backend para la imagen grande
            // Para restaurantes de Google Places viene en imagenUrl, para de la app puede venir en imagenDestacada
            imagenUrl: data.imagenUrl || data.ImagenUrl || data.imagenDestacada || data.ImagenDestacada || null,
            imagenesInterior: data.imagenesInterior || data.ImagenesInterior || [],
            imagenesComida: data.imagenesComida || data.ImagenesComida || [],
            menu: data.menu || data.Menu ? {
                nombreMenu: (data.menu || data.Menu)?.nombreMenu || (data.menu || data.Menu)?.NombreMenu || '',
                moneda: (data.menu || data.Menu)?.moneda || (data.menu || data.Menu)?.Moneda || 'ARS',
                categorias: ((data.menu || data.Menu)?.categorias || (data.menu || data.Menu)?.Categorias || []).map((cat: Record<string, unknown>) => ({
                    nombre: (cat.nombre || cat.Nombre || '') as string,
                    items: ((cat.items || cat.Items || []) as Array<Record<string, unknown>>).map((item: Record<string, unknown>) => ({
                        nombre: (item.nombre || item.Nombre || '') as string,
                        descripcion: (item.descripcion || item.Descripcion || null) as string | null,
                        precios: ((item.precios || item.Precios || []) as Array<Record<string, unknown>>).map((precio: Record<string, unknown>) => ({
                            tamaño: (precio.tamaño || precio.Tamaño || '') as string,
                            monto: (precio.monto || precio.Monto || 0) as number
                        }))
                    }))
                }))
            } : null,

            // Reviews separadas
            reviewsLocales: ((data.reviewsLocales || data.ReviewsLocales || []) as Array<Record<string, unknown>>).map((r: Record<string, unknown>) => mapReview(r, (data.id || data.Id || '') as string)),
            reviewsGoogle: ((data.reviewsGoogle || data.ReviewsGoogle || []) as Array<Record<string, unknown>>).map((r: Record<string, unknown>) => mapReview(r, (data.id || data.Id || '') as string)),

            // Mantener compatibilidad con reviews antiguas
            reviews: [
                ...((data.reviewsLocales || data.ReviewsLocales || []) as Array<Record<string, unknown>>).map((r: Record<string, unknown>) => mapReview(r, (data.id || data.Id || '') as string)),
                ...((data.reviewsGoogle || data.ReviewsGoogle || []) as Array<Record<string, unknown>>).map((r: Record<string, unknown>) => mapReview(r, (data.id || data.Id || '') as string))
            ],

            // Estado de favorito (viene directamente del backend)
            esFavorito: data.esFavorito ?? data.EsFavorito ?? false,
        }

        return { success: true, data: restaurant }
    } catch (error) {
        console.error('Error getting restaurant:', error)
        return {
            success: false,
            error: 'Error al cargar el restaurante',
        }
    }
}

export async function getRecomendacion(
    restauranteId: string
): Promise<ApiResponse<{ explicacion: string }>> {
    try {
        const res = await fetch(`${API_URL}/api/Recomendador/${restauranteId}/recomendacion`, {
            headers: await getAuthHeaders(),
            cache: 'no-store',
        })

        if (!res.ok) {
            return {
                success: false,
                error: 'No se pudo obtener la recomendación',
            }
        }

        const data = await res.json()

        return {
            success: true,
            data: {
                explicacion: data.explicacion || data.Explicacion || '',
            },
        }
    } catch (error) {
        console.error('Error getting recomendacion:', error)
        return {
            success: false,
            error: 'Error al cargar la recomendación',
        }
    }
}

export async function getRestaurantMetrics(
    id: string
): Promise<ApiResponse<RestauranteMetricasDashboard>> {
    try {
        const headers = await getAuthHeaders()

        const res = await fetch(`${API_URL}/api/Restaurantes/${id}/metricas`, {
            method: 'GET',
            headers,
            cache: 'no-store',
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            return {
                success: false,
                error:
                    errorData?.error ||
                    'Error al obtener las métricas del restaurante',
            }
        }

        const data = (await res.json()) as RestauranteMetricasDashboard

        return {
            success: true,
            data,
        }
    } catch (error) {
        console.error('Error getting restaurant metrics:', error)
        return {
            success: false,
            error: 'Error al obtener las métricas del restaurante',
        }
    }
}



export async function getRestaurantData(): Promise<ApiResponse<{ gustos: any[]; restricciones: any[] }>> {
    try {
        const headers = await getAuthHeaders()
        const response = await fetch(`${API_URL}/api/Restaurantes/registro-datos`, {
            method: 'GET',
            headers,
            cache: 'no-store',
        })

        if (!response.ok) {
            return {
                success: false,
                error: 'Error al obtener datos de registro',
            }
        }

        const rawData = await response.json()

        const gustosRaw = (rawData as { Gustos?: unknown[]; gustos?: unknown[] }).Gustos ||
            (rawData as { Gustos?: unknown[]; gustos?: unknown[] }).gustos ||
            []
        const restriccionesRaw = (rawData as { Restricciones?: unknown[]; restricciones?: unknown[] }).Restricciones ||
            (rawData as { Restricciones?: unknown[]; restricciones?: unknown[] }).restricciones ||
            []

        const gustosArray = Array.isArray(gustosRaw) ? gustosRaw : []
        const restriccionesArray = Array.isArray(restriccionesRaw) ? restriccionesRaw : []

        const mappedData = {
            gustos: gustosArray.map((item) => {
                const typedItem = item as { id?: string | number; Id?: string | number; nombre?: string; Nombre?: string }
                return {
                    id: String(typedItem.id || typedItem.Id || ''),
                    nombre: typedItem.nombre || typedItem.Nombre || '',
                }
            }),
            restricciones: restriccionesArray.map((item) => {
                const typedItem = item as { id?: string | number; Id?: string | number; nombre?: string; Nombre?: string }
                return {
                    id: String(typedItem.id || typedItem.Id || ''),
                    nombre: typedItem.nombre || typedItem.Nombre || '',
                }
            }),
        }

        return { success: true, data: mappedData }
    } catch (error) {
        console.error('Error getting restaurant data:', error)
        return {
            success: false,
            error: 'Error interno del servidor',
        }
    }
}

export async function updateRestaurant(
    id: string,
    data: any
): Promise<ApiResponse<any>> {
    try {
        const headers = await getAuthHeaders()
        const res = await fetch(`${API_URL}/api/Restaurantes/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
        })

        if (!res.ok) {
            let errorMessage = 'Error al actualizar el restaurante'
            try {
                const errorData = await res.json()
                errorMessage = errorData.error || errorData.message || errorMessage
            } catch { }
            return { success: false, error: errorMessage }
        }

        const responseData = await res.json()
        return { success: true, data: responseData }
    } catch (error) {
        console.error('Error updating restaurant:', error)
        return { success: false, error: 'Error interno al actualizar el restaurante' }
    }
}

export async function updateRestaurantImage(
    id: string,
    tipo: string,
    formData: FormData
): Promise<ApiResponse<any>> {
    try {
        const headers = await getAuthHeaders()
        // Remove Content-Type header to let browser set it with boundary for FormData
        const { 'Content-Type': _, ...headersWithoutContentType } = headers as any

        const res = await fetch(`${API_URL}/api/Restaurantes/${id}/imagenes/${tipo}`, {
            method: 'PUT',
            headers: headersWithoutContentType,
            body: formData,
        })

        if (!res.ok) {
            let errorMessage = 'Error al actualizar imagen'
            try {
                const errorData = await res.json()
                errorMessage = errorData.error || errorData.message || errorMessage
            } catch { }
            return { success: false, error: errorMessage }
        }

        const data = await res.json()
        return { success: true, data }
    } catch (error) {
        console.error('Error updating restaurant image:', error)
        return { success: false, error: 'Error interno al actualizar la imagen' }
    }
}
