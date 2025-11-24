'use server'

import { cookies } from 'next/headers'
import { API_URL } from '@/constants'
import { ApiResponse } from '@/types'

const ERROR_MESSAGES = {
    MISSING_TOKEN: 'No autorizado: falta token',
    MISSING_ID: 'ID del restaurante es requerido',
    ADD_FAILED: 'No se pudo agregar el favorito',
    REMOVE_FAILED: 'No se pudo quitar el favorito',
    VERIFY_FAILED: 'Error al verificar favorito',
    INTERNAL_ERROR: 'Error interno del servidor',
} as const

/**
 * Agregar un restaurante a favoritos
 */
export async function addFavoriteRestaurant(
    restauranteId: string
): Promise<ApiResponse<null>> {
    try {
        if (!restauranteId) {
            return { success: false, error: ERROR_MESSAGES.MISSING_ID }
        }

        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return { success: false, error: ERROR_MESSAGES.MISSING_TOKEN }
        }

        const response = await fetch(`${API_URL}/api/Restaurantes/favorito/${restauranteId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            const errorText = await response.text().catch(() => '')
            console.error(`Error al agregar favorito (${response.status}):`, errorText)
            return {
                success: false,
                error: ERROR_MESSAGES.ADD_FAILED
            }
        }

        return { success: true, data: null }
    } catch (error) {
        console.error('Error in addFavoriteRestaurant:', error)
        return { success: false, error: ERROR_MESSAGES.INTERNAL_ERROR }
    }
}

/**
 * Quitar un restaurante de favoritos
 */
export async function removeFavoriteRestaurant(
    restauranteId: string
): Promise<ApiResponse<null>> {
    try {
        if (!restauranteId) {
            return { success: false, error: ERROR_MESSAGES.MISSING_ID }
        }

        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return { success: false, error: ERROR_MESSAGES.MISSING_TOKEN }
        }

        const response = await fetch(`${API_URL}/api/Restaurantes/favorito/${restauranteId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            const errorText = await response.text().catch(() => '')
            console.error(`Error al quitar favorito (${response.status}):`, errorText)
            return {
                success: false,
                error: ERROR_MESSAGES.REMOVE_FAILED
            }
        }

        return { success: true, data: null }
    } catch (error) {
        console.error('Error in removeFavoriteRestaurant:', error)
        return { success: false, error: ERROR_MESSAGES.INTERNAL_ERROR }
    }
}

/**
 * Verificar si un restaurante es favorito
 */
export async function checkFavoriteRestaurant(
    restauranteId: string
): Promise<ApiResponse<{ isFavourite: boolean }>> {
    try {
        if (!restauranteId) {
            return { success: false, error: ERROR_MESSAGES.MISSING_ID }
        }

        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            // Si no hay token, asumir que no es favorito
            return { success: true, data: { isFavourite: false } }
        }

        // Obtener la lista de favoritos y verificar si el restaurante está en ella
        const response = await fetch(`${API_URL}/api/Restaurantes/favoritos`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            // Si falla, asumir que no es favorito
            return { success: true, data: { isFavourite: false } }
        }

        const favoritos = await response.json()
        const isFavourite = Array.isArray(favoritos)
            ? favoritos.some((fav: { id?: string; Id?: string }) =>
                (fav.id || fav.Id) === restauranteId
            )
            : false

        return { success: true, data: { isFavourite } }
    } catch (error) {
        console.error('Error in checkFavoriteRestaurant:', error)
        // En caso de error, asumir que no es favorito
        return { success: true, data: { isFavourite: false } }
    }
}
