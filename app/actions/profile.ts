'use server'
import { API_URL } from '@/constants'
import { ApiResponse, User } from '@/types'
import { getAuthHeaders } from './common'

export async function getCurrentUserProfile(): Promise<ApiResponse<User>> {
    try {
        const res = await fetch(`${API_URL}/Usuario/perfil`, {
            headers: await getAuthHeaders(),
            cache: 'no-store',
        })

        if (!res.ok) {
            return {
                success: false,
                error: 'Error al cargar el perfil',
            }
        }

        const data = await res.json()
        return { success: true, data }
    } catch (error) {
        console.error('Error fetching current user profile:', error)
        return {
            success: false,
            error: 'Error al cargar el perfil',
        }
    }
}

export async function getCurrentUser(): Promise<ApiResponse<User>> {
    try {
        const res = await fetch(`${API_URL}/Usuario/me`, {
            headers: await getAuthHeaders(),
            cache: 'no-store',
        })

        if (!res.ok) {
            const errorText = await res.text()
            return {
                success: false,
                error: errorText || 'Error al obtener usuario',
            }
        }

        const data = await res.json()
        return { success: true, data }
    } catch (error) {
        console.error('Error fetching current user:', error)
        return {
            success: false,
            error: 'Error al obtener usuario',
        }
    }
}

export async function getRegistrationStatus(): Promise<ApiResponse<{ registroCompleto: boolean }>> {
    try {
        const res = await fetch(`${API_URL}/usuario/estado-registro`, {
            headers: await getAuthHeaders(),
            cache: 'no-store',
        })

        if (!res.ok) {
            return {
                success: true,
                data: { registroCompleto: false },
            }
        }

        const data = await res.json()
        return { success: true, data }
    } catch (error) {
        console.error('Error fetching registration status:', error)
        return {
            success: true,
            data: { registroCompleto: false },
        }
    }
}

export async function getUserResumen(modo: 'registro' | 'edicion' = 'registro'): Promise<ApiResponse<any>> {
    try {
        const res = await fetch(`${API_URL}/Usuario/resumen?modo=${modo}`, {
            headers: await getAuthHeaders(),
            cache: 'no-store',
        })

        if (!res.ok) {
            const error = await res.text()
            return {
                success: false,
                error: error || 'Error al obtener resumen',
            }
        }

        const data = await res.json()
        return { success: true, data }
    } catch (error) {
        console.error('Error fetching user resumen:', error)
        return {
            success: false,
            error: 'Error al obtener resumen',
        }
    }
}

