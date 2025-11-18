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

