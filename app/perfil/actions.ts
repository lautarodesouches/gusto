'use server'
import { cookies } from 'next/headers'
import { API_URL } from '@/constants'
import { ApiResponse, User } from '@/types'
import admin from '@/lib/firebaseAdmin'

async function getAuthHeaders(): Promise<HeadersInit> {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    }
}

export async function getProfile(username: string): Promise<ApiResponse<User>> {
    try {
        const res = await fetch(`${API_URL}/Usuario/${username}/perfil`, {
            headers: await getAuthHeaders(),
            cache: 'no-store',
        })

        if (!res.ok) {
            return {
                success: false,
                error: 'Usuario no encontrado',
            }
        }

        const data = await res.json()

        return { success: true, data }
    } catch (error) {
        console.error('Error fetching profile:', error)
        return {
            success: false,
            error: 'Error al cargar el perfil',
        }
    }
}

export async function updateProfile(
    formData: FormData
): Promise<ApiResponse<User>> {
    try {
        const data = {
            nombre: formData.get('nombre') as string,
            apellido: formData.get('apellido') as string,
            bio: formData.get('bio') as string,
            username: formData.get('username') as string,
        }

        const res = await fetch(`${API_URL}/Usuario/actualizar`, {
            method: 'PUT',
            headers: await getAuthHeaders(),
            body: JSON.stringify(data),
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            return {
                success: false,
                error: errorData?.error || 'Error al actualizar perfil',
            }
        }

        const updatedUser = await res.json()

        return { success: true, data: updatedUser }
    } catch (error) {
        console.error('Error updating profile:', error)
        return {
            success: false,
            error: 'Error al actualizar el perfil',
        }
    }
}

export async function getCurrentUserId(): Promise<string | null> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) return null

        const decodedToken = await admin.auth().verifyIdToken(token)

        return decodedToken.uid
    } catch (error) {
        console.error('Error getting current user ID:', error)
        return null
    }
}

export async function isOwnProfile(profileUserId: string): Promise<boolean> {
    const currentUserId = await getCurrentUserId()
    return currentUserId === profileUserId
}

export async function checkFriendshipStatus(
    userId: string
): Promise<ApiResponse<{ isFriend: boolean; hasPendingRequest: boolean }>> {
    try {
        const res = await fetch(`${API_URL}/Amistad/estado/${userId}`, {
            headers: await getAuthHeaders(),
            cache: 'no-store',
        })

        if (!res.ok) {
            return {
                success: false,
                error: 'Error al verificar estado',
            }
        }

        const status = await res.json()

        return { success: true, data: status }
    } catch (error) {
        console.error('Error checking friendship:', error)
        return {
            success: false,
            error: 'Error al verificar amistad',
        }
    }
}
