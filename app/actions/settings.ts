'use server'

import { cookies } from 'next/headers'
import { API_URL } from '@/constants'
import { ApiResponse, Restaurant, User } from '@/types'

const ERROR_MESSAGES = {
    MISSING_TOKEN: 'No autorizado: falta token',
    UPDATE_FAILED: 'No se pudo actualizar el perfil',
    FETCH_FAILED: 'No se pudo obtener los favoritos',
    INTERNAL_ERROR: 'Error interno del servidor',
    IMAGE_TOO_LARGE: 'La imagen es demasiado grande. Por favor, elige una imagen más pequeña.',
} as const

/**
 * Obtener restaurantes favoritos del usuario
 */
export async function getFavoriteRestaurants(): Promise<ApiResponse<Restaurant[]>> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return { success: false, error: ERROR_MESSAGES.MISSING_TOKEN }
        }

        const response = await fetch(`${API_URL}/PerfilUsuario/favoritos`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        })

        if (!response.ok) {
            return { success: false, error: ERROR_MESSAGES.FETCH_FAILED }
        }

        const data = await response.json()
        return { success: true, data }
    } catch (error) {
        console.error('Error in getFavoriteRestaurants:', error)
        return { success: false, error: ERROR_MESSAGES.INTERNAL_ERROR }
    }
}

/**
 * Actualizar perfil de usuario
 */
export async function updateUserProfile(formData: FormData): Promise<ApiResponse<User>> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return { success: false, error: ERROR_MESSAGES.MISSING_TOKEN }
        }

        const response = await fetch(`${API_URL}/PerfilUsuario`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        })

        if (response.status === 413) {
            return {
                success: false,
                error: ERROR_MESSAGES.IMAGE_TOO_LARGE
            }
        }

        if (!response.ok) {
            const errorText = await response.text().catch(() => '')
            console.error(`Error al actualizar perfil (${response.status}):`, errorText)
            return {
                success: false,
                error: ERROR_MESSAGES.UPDATE_FAILED
            }
        }

        const updatedUser = await response.json()
        return { success: true, data: updatedUser }
    } catch (error) {
        console.error('Error in updateUserProfile:', error)
        return { success: false, error: ERROR_MESSAGES.INTERNAL_ERROR }
    }
}
