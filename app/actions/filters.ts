'use server'
import { API_URL } from '@/constants'
import { ApiResponse, Filters } from '@/types'
import { getAuthHeaders } from './common'

async function getDishes() {
    try {
        const res = await fetch(`${API_URL}/Gusto`, {
            method: 'GET',
            headers: {
                ...(await getAuthHeaders()),
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            return {
                success: false,
                error: errorData?.mensaje || 'Error al traer platos',
            }
        }

        interface Taste {
            id: string
            nombre: string
            imageUrl: string
            seleccionado: boolean
        }

        interface Response {
            pasoActual: string
            next: string
            gustos: Taste[]
        }

        const tastes: Response = await res.json()

        const modifyTastes = tastes.gustos.map(
            ({ id, nombre: name }: Taste) => ({
                id,
                name,
                value: name,
            })
        )

        return { success: true, data: modifyTastes }
    } catch (error) {
        console.error('Error getting dishes:', error)
        return {
            success: false,
            error: 'Error al traer platos',
        }
    }
}

export async function getFilters(): Promise<ApiResponse<Filters>> {
    try {

        const dishes = (await getDishes()).data || []

        // Limit
        dishes.length = 10

        const ratings = [
            { id: '1', name: '3.5', value: '3.5' },
            { id: '2', name: '4', value: '4' },
            { id: '3', name: '4.5', value: '4.5' },
        ]

        const data = {
            dishes,
            ratings,
        }

        return { success: true, data }
    } catch (error) {
        console.error('Error getting friend:', error)
        return {
            success: false,
            error: 'Error al obtener amigos',
        }
    }
}
