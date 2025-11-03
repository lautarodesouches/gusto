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
                tags: ['groups']
            }
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
