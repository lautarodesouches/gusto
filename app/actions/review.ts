'use server'

import { API_URL } from '@/constants'
import { getAuthHeaders } from './common'
import { ApiResponse } from '@/types'

export async function submitReview(formData: {
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
            body: JSON.stringify(formData),
            cache: 'no-store',
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            return {
                success: false,
                error: errorData?.mensaje || 'Error creando opinion',
            }
        }

        return { success: true, data: null }
    } catch (error) {
        console.error('Error creating review:', error)
        return {
            success: false,
            error: 'Error al crear opinion',
        }
    }
}
