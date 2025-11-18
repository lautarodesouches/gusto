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

        const restaurant = await res.json()
        
        if (restaurant.Reviews && !restaurant.reviews) {
            restaurant.reviews = restaurant.Reviews
            delete restaurant.Reviews
        }
        
        if (!restaurant.reviews) {
            restaurant.reviews = []
        }
        
        restaurant.reviews = restaurant.reviews.map((review: Review): Review => {
            const autor = review.autorExterno || 
                         review.usuario?.nombre || 
                         review.usuario?.username ||
                         'Anónimo'
            
            const foto = review.imagenAutorExterno ||
                        review.usuario?.fotoPerfilUrl ||
                        ''
            
            const fotos = review.fotos || []
            const images = Array.isArray(fotos) 
                ? fotos.map((f) => f.url || '').filter((url: string) => url)
                : []
            
            return {
                id: review.id || '',
                autor: autor,
                rating: review.valoracion || review.rating || 0,
                texto: review.opinion || review.texto || '',
                fecha: review.fechaCreacion || review.fecha || '',
                foto: foto,
                restauranteId: review.restauranteId || restaurant.id,
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
        })
        
        return { success: true, data: restaurant }
    } catch (error) {
        console.error('Error getting restaurant:', error)
        return {
            success: false,
            error: 'Error al cargar el restaurante',
        }
    }
}

