'use server'

import { API_URL } from '@/constants'
import { ApiResponse, Restaurant } from '@/types'
import { getAuthHeaders } from './common'
import { cookies } from 'next/headers'

export interface RestaurantSearchParams {
    nearLat?: string
    nearLng?: string
    gustos?: string
    rating?: string
    radius?: string
    amigoUsername?: string
}

/**
 * Busca restaurantes con los parámetros especificados
 */
export async function searchRestaurants(
    params: RestaurantSearchParams
): Promise<{
    success: boolean
    data?: { total: number; recomendaciones: Restaurant[] }
    error?: string
    code?: string
}> {
    try {
        const headers = await getAuthHeaders()

        const apiUrl = new URL(`${API_URL}/api/Restaurantes`)

        apiUrl.searchParams.append('top', '200')
        apiUrl.searchParams.append('radiusMeters', params.radius || '3000')

        if (params.nearLat)
            apiUrl.searchParams.append('near.lat', params.nearLat)
        if (params.nearLng)
            apiUrl.searchParams.append('near.lng', params.nearLng)
        if (params.gustos) apiUrl.searchParams.append('gustos', params.gustos)
        if (params.rating) apiUrl.searchParams.append('rating', params.rating)
        if (params.amigoUsername)
            apiUrl.searchParams.append('amigoUsername', params.amigoUsername)

        const res = await fetch(apiUrl.toString(), {
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        })

        if (!res.ok) {
            if (res.status === 404) {
                return {
                    success: true,
                    data: { total: 0, recomendaciones: [] },
                }
            }

            const errorText = await res.text().catch(() => '')

            if (
                res.status === 400 &&
                errorText.toLowerCase().includes('gustos que quiere buscar no son validos')
            ) {
                return {
                    success: true,
                    data: { total: 0, recomendaciones: [] as Restaurant[] },
                    code: 'NO_GUSTOS_VALIDOS',
                }
            }

            return {
                success: false,
                error: 'No se pudieron obtener los restaurantes',
            }
        }

        const data = await res.json()
        return { success: true, data }
    } catch {
        return {
            success: false,
            error: 'Error interno del servidor',
        }
    }
}

export interface GroupRestaurantSearchParams {
    grupoId: string
    nearLat?: string
    nearLng?: string
    radiusMeters?: string
    top?: string
}

/**
 * Obtiene restaurantes recomendados para un grupo
 */
export async function getGroupRestaurants(
    params: GroupRestaurantSearchParams
): Promise<{
    success: boolean
    data?: { recomendaciones: Restaurant[] }
    error?: string
}> {
    try {
        const headers = await getAuthHeaders()

        const apiUrl = new URL(
            `${API_URL}/Grupo/restaurantes/${params.grupoId}`
        )

        apiUrl.searchParams.append(
            'radiusMeters',
            params.radiusMeters || '1000'
        )
        apiUrl.searchParams.append('top', params.top || '10')
        if (params.nearLat)
            apiUrl.searchParams.append('near.lat', params.nearLat)
        if (params.nearLng)
            apiUrl.searchParams.append('near.lng', params.nearLng)

        const res = await fetch(apiUrl.toString(), {
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        })

        if (!res.ok) {
            const text = await res.text().catch(() => '')
            
            // Si es 404 y el mensaje indica que no se encontraron restaurantes, devolver código especial
            if (res.status === 404) {
                try {
                    const errorData = JSON.parse(text)
                    const message = errorData.message || errorData.error || text
                    const messageLower = message.toLowerCase()
                    
                    // Detectar si es porque no se encontraron restaurantes (no es un error real)
                    if (
                        messageLower.includes('no se encontraron restaurantes') ||
                        messageLower.includes('no tiene gustos validos') ||
                        messageLower.includes('gustos del usuario')
                    ) {
                        return {
                            success: true,
                            data: { recomendaciones: [] },
                            error: 'NO_RESTAURANTES_ENCONTRADOS', // Código especial para manejar en el frontend
                        }
                    }
                } catch {
                    // Si no se puede parsear, tratar como error normal
                }
            }
            
            console.error('Error al traer restaurantes del grupo:', text)
            return {
                success: false,
                error: 'No se pudieron obtener los restaurantes del grupo',
            }
        }

        const data = await res.json()
        // El backend devuelve directamente un array, envolverlo en recomendaciones
        return { success: true, data: { recomendaciones: data } }
    } catch (error) {
        console.error('Error getting group restaurants:', error)
        return {
            success: false,
            error: 'Error interno del servidor',
        }
    }
}

type MyRestaurantResponse = string | { id?: string; Id?: string }

/**
 * Acción para obtener el restaurante del dueño actual
 */
export async function getMyRestaurant(): Promise<ApiResponse<MyRestaurantResponse>> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return {
                success: false,
                error: 'No autorizado: falta token',
            }
        }

        if (!API_URL) {
            return {
                success: false,
                error: 'Error de configuración: API_URL no definida',
            }
        }

        // Llamar al backend para obtener el restaurante del dueño
        const response = await fetch(`${API_URL}/api/Restaurantes/mio`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return {
                success: false,
                error: errorData.message || 'Error al obtener restaurante',
            }
        }

        const data = await response.json()
        return { success: true, data }
    } catch (error) {
        console.error('Error en getMyRestaurant:', error)
        return {
            success: false,
            error: 'Error interno del servidor',
        }
    }
}

/**
 * Busca restaurantes por texto (nombre)
 */
export async function searchRestaurantsByText(texto: string): Promise<{
    success: boolean
    data?: Restaurant[]
    error?: string
}> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return {
                success: false,
                error: 'No autorizado: falta token',
            }
        }

        if (!texto || texto.trim() === '') {
            return {
                success: false,
                error: 'El texto es requerido',
            }
        }

        const apiUrl = new URL(`${API_URL}/api/Restaurantes/buscar`)
        apiUrl.searchParams.append('texto', texto.trim())

        const res = await fetch(apiUrl.toString(), {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        })

        if (!res.ok) {
            const errorText = await res.text().catch(() => '')
            console.error('Error al buscar restaurantes por texto:', errorText)
            return {
                success: false,
                error: 'No se pudieron buscar los restaurantes',
            }
        }

        const data = await res.json()
        return { success: true, data }
    } catch (error) {
        console.error('Error in searchRestaurantsByText:', error)
        return {
            success: false,
            error: 'Error interno del servidor',
        }
    }
}
