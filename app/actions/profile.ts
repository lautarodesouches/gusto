'use server'
import { cookies } from 'next/headers'
import { API_URL } from '@/constants'
import { ApiResponse, User } from '@/types'
import { UpdateProfilePayload } from '@/types/profile'
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
    data: UpdateProfilePayload | FormData
): Promise<ApiResponse<User>> {
    try {
        let payload: UpdateProfilePayload

        if (data instanceof FormData) {
            payload = {
                nombre: data.get('nombre') as string,
                apellido: data.get('apellido') as string,
                bio: data.get('bio') as string,
                username: data.get('username') as string,
            }
        } else {
            payload = {
                username: data.username,
                esPrivado: data.esPrivado,
                nombre: data.nombre,
                apellido: data.apellido,
                bio: data.bio,
            }
        }

        const res = await fetch(`${API_URL}/Usuario/actualizar`, {
            method: 'PUT',
            headers: await getAuthHeaders(),
            body: JSON.stringify(payload),
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
    } catch (error: any) {
        console.error('Error updating profile:', error)

        // Detectar error de límite de tamaño de Next.js Server Actions
        if (error.message && error.message.includes('Body exceeded')) {
            return {
                success: false,
                error: 'La imagen es demasiado grande. El límite es 10MB.',
            }
        }

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

export async function getCurrentUser(): Promise<ApiResponse<User>> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return {
                success: false,
                error: 'No autenticado',
            }
        }

        const res = await fetch(`${API_URL}/Usuario/me`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        })

        if (!res.ok) {
            return {
                success: false,
                error: 'Error al obtener usuario actual',
            }
        }

        const data = await res.json()

        return { success: true, data }
    } catch (error) {
        console.error('Error fetching current user:', error)
        return {
            success: false,
            error: 'Error al cargar el usuario',
        }
    }
}

export async function getRegistrationStatus(): Promise<ApiResponse<{ registroCompleto: boolean }>> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return {
                success: false,
                error: 'No autenticado',
            }
        }

        // Llamar al backend al endpoint original que indica si el registro está completo
        const res = await fetch(`${API_URL}/Usuario/estado-registro`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        })

        if (!res.ok) {
            return {
                success: false,
                error: 'Error al verificar estado de registro',
            }
        }

        const data = await res.json()
        const registroCompleto = Boolean((data as { registroCompleto?: boolean }).registroCompleto)

        return { success: true, data: { registroCompleto } }
    } catch {
        return {
            success: true,
            data: { registroCompleto: false },
        }
    }
}
