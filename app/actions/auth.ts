'use server'

import { API_URL } from '@/constants'
import { ApiResponse } from '@/types'
import { cookies } from 'next/headers'

/**
 * Acción para refrescar los claims de Firebase del usuario
 * Llama al backend para actualizar el rol en Firebase basado en la BD
 */
export async function refreshClaims(): Promise<ApiResponse<unknown>> {
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

        // Llamar al backend para refrescar los claims
        const response = await fetch(`${API_URL}/Autenticacion/refresh-claims`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return {
                success: false,
                error: errorData.message || 'Error al refrescar claims',
            }
        }

        const data = await response.json()
        return { success: true, data }
    } catch (error) {
        console.error('Error en refreshClaims:', error)
        return {
            success: false,
            error: 'Error interno del servidor',
        }
    }
}
