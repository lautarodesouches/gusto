// app/actions/profile.ts
'use server'

import { cookies } from 'next/headers'
import { API_URL } from '@/constants'
import { User } from '@/types'

interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
}

async function getAuthHeaders(): Promise<HeadersInit> {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    }
}

/**
 * Obtiene el perfil de un usuario
 */
export async function getProfile(userId: string): Promise<ApiResponse<User>> {
    return {
        success: true,
        data: {
            nombre: 'Lautaro',
            fotoPerfilUrl: '',
            apellido: 'Desouches',
            username: 'lautaro',
            gustos: [
                {
                    id: '22222222-0001-0001-0001-000000000004',
                    nombre: 'Milanesa con papas',
                },
                {
                    id: '22222222-0001-0001-0001-000000000005',
                    nombre: 'Tacos',
                },
                {
                    id: '22222222-0001-0001-0001-000000000009',
                    nombre: 'Ceviche',
                },
                {
                    id: '22222222-0001-0001-0001-000000000010',
                    nombre: 'Helado',
                },
                {
                    id: '22222222-0001-0001-0001-000000000013',
                    nombre: 'Pollo grillado',
                },
                {
                    id: '22222222-0001-0001-0001-000000000014',
                    nombre: 'Kebab',
                },
                {
                    id: '22222222-0001-0001-0001-000000000015',
                    nombre: 'Ensalada verde',
                },
            ],
            visitados: [
                {
                    id: 1,
                    nombre: 'Clöe Bakehouse',
                    lat: -34.645123,
                    lng: -58.5634451,
                },
                {
                    id: 2,
                    nombre: 'Maledetto Trattoria',
                    lat: -34.6434266,
                    lng: -58.5659122,
                },
                {
                    id: 3,
                    nombre: 'La Diva Ramos Mejia',
                    lat: -34.6427713,
                    lng: -58.566083,
                },
            ],
        },
    }

    try {
        const res = await fetch(`${API_URL}/Usuario/${userId}`, {
            headers: await getAuthHeaders(),
            cache: 'no-store', // o next: { revalidate: 60 } para cache
        })

        if (!res.ok) {
            return {
                success: false,
                error: 'Usuario no encontrado',
            }
        }

        const user = await res.json()
        return { success: true, data: user }
    } catch (error) {
        console.error('Error fetching profile:', error)
        return {
            success: false,
            error: 'Error al cargar el perfil',
        }
    }
}

/**
 * Obtiene el perfil del usuario autenticado
 */
export async function getMyProfile(): Promise<ApiResponse<User>> {
    try {
        const res = await fetch(`${API_URL}/Usuario/me`, {
            headers: await getAuthHeaders(),
            cache: 'no-store',
        })

        if (!res.ok) {
            return {
                success: false,
                error: 'Error al obtener perfil',
            }
        }

        const user = await res.json()
        return { success: true, data: user }
    } catch (error) {
        console.error('Error fetching own profile:', error)
        return {
            success: false,
            error: 'Error al cargar el perfil',
        }
    }
}

/**
 * Actualiza el perfil del usuario
 */
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
