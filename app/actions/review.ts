'use server'

import { API_URL } from '@/constants'
import { getAuthHeaders } from './common'
import { ApiResponse } from '@/types'

/**
 * Envía una opinión/review de un restaurante
 * Soporta FormData con archivos (imágenes)
 */
export async function submitRestaurantReview(formData: FormData): Promise<ApiResponse<null>> {
    try {
        const headers = await getAuthHeaders()
        // No incluir Content-Type para FormData, el navegador lo maneja automáticamente
        const { 'Content-Type': _, ...headersWithoutContentType } = headers as Record<string, string>
        
        const res = await fetch(`${API_URL}/api/OpinionRestaurante`, {
            method: 'POST',
            headers: {
                ...headersWithoutContentType,
            },
            body: formData,
            cache: 'no-store',
        })

        if (!res.ok) {
            const errorText = await res.text().catch(() => '')
            console.error('Error al crear opinión:', errorText)
            return {
                success: false,
                error: errorText || 'Error al crear opinión',
            }
        }

        const contentType = res.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
            await res.json()
        } else {
            await res.text()
        }

        return { success: true, data: null }
    } catch (error) {
        console.error('Error submitting restaurant review:', error)
        return {
            success: false,
            error: 'Error interno del servidor',
        }
    }
}

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
