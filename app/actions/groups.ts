'use server'
import { API_URL } from '@/constants'
import { ApiResponse, Group } from '@/types'
import { getAuthHeaders } from './common'
import { revalidateTag } from 'next/cache'

export async function getGroups(): Promise<ApiResponse<Group[]>> {
    try {
        const res = await fetch(`${API_URL}/Grupo/mis-grupos`, {
            method: 'GET',
            headers: await getAuthHeaders(),
            cache: 'no-store',
            next: {
                tags: ['groups'],
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
        console.error('Error getting group:', error)
        return {
            success: false,
            error: 'Error al obtener grupos',
        }
    }
}

export async function getGroupsRequests(): Promise<ApiResponse<Group[]>> {
    try {
        const res = await fetch(`${API_URL}/Grupo/invitaciones`, {
            method: 'GET',
            headers: await getAuthHeaders(),
            cache: 'no-store',
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
        console.error('Error getting groups requests:', error)
        return {
            success: false,
            error: 'Error al obtener solicitudes de grupos',
        }
    }
}

export async function getGroupsData(): Promise<
    ApiResponse<{ groups: Group[]; groupsRequests: Group[] }>
> {
    try {
        const groups = await getGroups()

        const groupsRequests = await getGroupsRequests()

        return {
            success: true,
            data: {
                groups: groups.data || [],
                groupsRequests: groupsRequests.data || [],
            },
        }
    } catch (error) {
        console.error('Error getting group data:', error)
        return {
            success: false,
            error: 'Error al obtener data de grupos',
        }
    }
}

export async function createGroup(payload: {
    name: string
    description: string
}): Promise<ApiResponse<null>> {
    try {
        const res = await fetch(`${API_URL}/Grupo/crear`, {
            method: 'POST',
            headers: {
                ...(await getAuthHeaders()),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombre: payload.name,
                descripcion: payload.description,
            }),
            cache: 'no-store',
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            return {
                success: false,
                error: errorData?.mensaje || 'Error creando grupo',
            }
        }

        revalidateTag('groups')

        return { success: true, data: null }
    } catch (error) {
        console.error('Error creating group:', error)
        return {
            success: false,
            error: 'Error al crear el grupo',
        }
    }
}

export async function inviteUserToGroup(
    groupId: string,
    identifier: string,
    message: string,
    inviteType: 'email' | 'username' = 'email'
): Promise<ApiResponse<null>> {
    try {
        const body: {
            emailUsuario?: string
            usuarioUsername?: string
            mensajePersonalizado: string
        } = {
            mensajePersonalizado: message,
        }

        if (inviteType === 'email') {
            body.emailUsuario = identifier
        } else {
            body.usuarioUsername = identifier
        }

        const res = await fetch(`${API_URL}/Grupo/${groupId}/invitar`, {
            method: 'POST',
            headers: await getAuthHeaders(),
            body: JSON.stringify(body),
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
            return {
                success: false,
                error: data?.message || 'Error al invitar',
            }
        }

        return { success: true, data: null }
    } catch (err) {
        console.error('Error inviting user to group:', err)
        return { success: false, error: 'Error al invitar usuario' }
    }
}

export async function removeGroupMember(
    groupId: string,
    username: string
): Promise<ApiResponse<null>> {
    try {
        const res = await fetch(
            `${API_URL}/Grupo/${groupId}/miembros/${username}`,
            {
                method: 'DELETE',
                headers: await getAuthHeaders(),
            }
        )

        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
            return {
                success: false,
                error: data?.message || 'Error al eliminar miembro',
            }
        }

        return { success: true, data: null }
    } catch (err) {
        console.error('Error removing group member:', err)
        return { success: false, error: 'Error al eliminar miembro' }
    }
}

export async function activateGroupMember(
    groupId: string,
    usuarioId: string
): Promise<ApiResponse<null>> {
    try {
        const url = new URL(`${API_URL}/Grupo/activarMiembro`)
        url.searchParams.append('grupoId', groupId)
        url.searchParams.append('UsuarioId', usuarioId)

        const res = await fetch(url.toString(), {
            method: 'PUT',
            headers: await getAuthHeaders(),
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
            return {
                success: false,
                error: data?.message || 'Error al activar miembro',
            }
        }

        return { success: true, data: null }
    } catch (err) {
        console.error('Error activating group member:', err)
        return { success: false, error: 'Error al activar miembro' }
    }
}

export async function deactivateGroupMember(
    groupId: string,
    usuarioId: string
): Promise<ApiResponse<null>> {
    try {
        const url = new URL(`${API_URL}/Grupo/desactivarMiembro`)
        url.searchParams.append('grupoId', groupId)
        url.searchParams.append('UsuarioId', usuarioId)

        const res = await fetch(url.toString(), {
            method: 'PUT',
            headers: await getAuthHeaders(),
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
            return {
                success: false,
                error: data?.message || 'Error al desactivar miembro',
            }
        }

        return { success: true, data: null }
    } catch (err) {
        console.error('Error deactivating group member:', err)
        return { success: false, error: 'Error al desactivar miembro' }
    }
}

export async function getGroup(id: string): Promise<ApiResponse<Group>> {
    try {
        const res = await fetch(`${API_URL}/Grupo/${id}`, {
            headers: await getAuthHeaders(),
            cache: 'no-store',
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            return {
                success: false,
                error: errorData.error || errorData.message || 'Error al obtener grupo',
            }
        }

        const data = await res.json()
        return { success: true, data }
    } catch (error) {
        console.error('Error getting group:', error)
        return {
            success: false,
            error: 'Error al obtener grupo',
        }
    }
}



export async function deleteGroup(groupId: string): Promise<ApiResponse<null>> {
    try {
        const res = await fetch(`${API_URL}/Grupo/${groupId}`, {
            method: 'DELETE',
            headers: await getAuthHeaders(),
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            return {
                success: false,
                error: errorData?.message || 'Error al eliminar grupo',
            }
        }

        revalidateTag('groups')
        return { success: true, data: null }
    } catch (error) {
        console.error('Error deleting group:', error)
        return {
            success: false,
            error: 'Error al eliminar el grupo',
        }
    }
}

export async function leaveGroup(groupId: string): Promise<ApiResponse<null>> {
    try {
        const res = await fetch(`${API_URL}/Grupo/${groupId}/abandonar`, {
            method: 'POST',
            headers: await getAuthHeaders(),
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            return {
                success: false,
                error: errorData?.message || 'Error al abandonar grupo',
            }
        }

        revalidateTag('groups')
        return { success: true, data: null }
    } catch (error) {
        console.error('Error leaving group:', error)
        return {
            success: false,
            error: 'Error al abandonar el grupo',
        }
    }
}

export async function updateGroupName(
    groupId: string,
    name: string
): Promise<ApiResponse<null>> {
    try {
        const res = await fetch(`${API_URL}/Grupo/${groupId}/nombre`, {
            method: 'PUT',
            headers: {
                ...(await getAuthHeaders()),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre: name }),
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            return {
                success: false,
                error: errorData?.message || 'Error al actualizar nombre',
            }
        }

        revalidateTag('groups')
        return { success: true, data: null }
    } catch (error) {
        console.error('Error updating group name:', error)
        return {
            success: false,
            error: 'Error al actualizar el nombre del grupo',
        }
    }
}