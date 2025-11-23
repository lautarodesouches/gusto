'use server'
import { API_URL } from '@/constants'
import { ApiResponse, Restaurant, Review } from '@/types'
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
            rating: data.rating || data.Rating || data.valoracion || data.Valoracion || null,
            valoracion: data.valoracion || data.Valoracion || data.rating || data.Rating || null,
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
        const res = await fetch(`${API_URL}/api/Recomendador/${restauranteId}`, {
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

