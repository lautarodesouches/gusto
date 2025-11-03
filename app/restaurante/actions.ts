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
        return { success: true, data: restaurant }
    } catch (error) {
        console.error('Error getting restaurant:', error)
        return {
            success: false,
            error: 'Error al cargar el restaurante',
        }
    }
}

