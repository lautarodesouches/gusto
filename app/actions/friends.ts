'use server'
import { API_URL } from '@/constants'
import { ApiResponse, Friend, SolicitudAmistadResponse, User } from '@/types'
import { getAuthHeaders } from './common'
import { revalidatePath, revalidateTag } from 'next/cache'


export async function getFriends(): Promise<ApiResponse<Friend[]>> {
    try {
        const res = await fetch(`${API_URL}/Amistad/amigos`, {
            method: 'GET',
            headers: await getAuthHeaders(),
            cache: 'no-store',
            next: {
                tags: ['friends'],
            },
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            return {
                success: false,
                error: errorData?.error || 'Error al enviar solicitud',
            }
        }

        const data = await res.json()

        return { success: true, data }
    } catch (error) {
        console.error('Error getting friend:', error)
        return {
            success: false,
            error: 'Error al obtener amigos',
        }
    }
}

export async function getFriendRequests(): Promise<ApiResponse<Friend[]>> {
    try {
        const res = await fetch(`${API_URL}/Amistad/solicitudes`, {
            method: 'GET',
            headers: await getAuthHeaders(),
            cache: 'no-store',
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            return {
                success: false,
                error: errorData?.error || 'Error al obtener solicitudes',
            }
        }

        const data: SolicitudAmistadResponse[] = await res.json()

        const requests: Friend[] = data.map((solicitud) => ({
            id: solicitud.id,
            nombre: solicitud.remitente.nombre,
            username: solicitud.remitente.username,
            email: solicitud.remitente.email,
            fotoPerfilUrl: solicitud.remitente.fotoPerfilUrl,
        }))

        return { success: true, data: requests }
    } catch (error) {
        console.error('Error getting friend requests:', error)
        return {
            success: false,
            error: 'Error al obtener solicitudes de amistad',
        }
    }
}


export async function getFriendsData(): Promise<
    ApiResponse<{ friends: Friend[]; friendsRequests: Friend[] }>
> {
    try {
        const [friendsRes, requestsRes] = await Promise.all([
            getFriends(),
            getFriendRequests(),
        ])

        if (
            !friendsRes.success ||
            !friendsRes.data ||
            !requestsRes.success ||
            !requestsRes.data
        ) {
            return {
                success: false,
                error:
                    friendsRes.error ||
                    requestsRes.error ||
                    'Error al cargar amigos o solicitudes',
            }
        }

        return {
            success: true,
            data: {
                friends: friendsRes.data,
                friendsRequests: requestsRes.data,
            },
        }
    } catch (error) {
        console.error('Error getting friends data:', error)
        return {
            success: false,
            error: 'Error al obtener data de amigos',
        }
    }
}

export async function addFriend(
    username: string
): Promise<ApiResponse<User>> {
    try {
        const res = await fetch(`${API_URL}/Amistad/enviar`, {
            method: 'POST',
            headers: await getAuthHeaders(),
            body: JSON.stringify({
                usernameDestino: username,
                mensaje: `${username} quiere ser tu amigo.`,
            }),
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            return {
                success: false,
                error: errorData?.error || 'Error al enviar solicitud',
            }
        }

        revalidatePath(`/perfil/${username}`)

        return { success: true }
    } catch (error) {
        console.error('Error sending friend request:', error)
        return {
            success: false,
            error: 'Error al enviar solicitud de amistad',
        }
    }
}

export async function deleteFriend(
    friendId: string,
    username: string
): Promise<ApiResponse<User>> {
    try {
        const res = await fetch(`${API_URL}/Amistad/${friendId}`, {
            method: 'DELETE',
            headers: await getAuthHeaders(),
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            return {
                success: false,
                error: errorData?.error || 'Error al eliminar',
            }
        }

        revalidatePath(`/perfil/${username}`)

        return { success: true }
    } catch (error) {
        console.error('Error deleting friend:', error)
        return {
            success: false,
            error: 'Error al eliminar amigo',
        }
    }
}

export async function respondToFriendInvitation(
    solicitudId: string,
    action: 'aceptar' | 'rechazar'
): Promise<ApiResponse<null>> {
    try {
        const res = await fetch(`${API_URL}/Amistad/${solicitudId}/${action}`, {
            method: 'POST',
            headers: await getAuthHeaders(),
            cache: 'no-store',
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            return {
                success: false,
                error: errorData?.error || 'Error al procesar la solicitud',
            }
        }

        revalidateTag('friends')

        return { success: true, data: null }
    } catch (error) {
        console.error('Error responding to friend invitation:', error)
        return {
            success: false,
            error: 'Error al procesar la solicitud de amistad',
        }
    }
}

export async function searchFriends(
    query: string
): Promise<ApiResponse<Friend[]>> {
    if (!query) return { success: true, data: [] }

    try {
        const res = await fetch(
            `${API_URL}/Amistad/buscar-usuarios/?username=${encodeURIComponent(
                query
            )}`,
            {
                method: 'GET',
                headers: await getAuthHeaders(),
                cache: 'no-store',
            }
        )

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            return {
                success: false,
                error: errorData?.error || 'Error al buscar amigos',
            }
        }

        const data: Friend[] = await res.json()

        return { success: true, data }
    } catch (error) {
        console.error('Error searching friends:', error)
        return { success: false, error: 'Error al buscar amigos' }
    }
}
