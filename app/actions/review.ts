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

        const valoracionStr = formData.get('valoracion')?.toString()
        const valoracion = valoracionStr ? parseFloat(valoracionStr) : null

        if (valoracion === null || isNaN(valoracion)) {
            return {
                success: false,
                error: 'Valoración inválida',
            }
        }

        // Validar que la valoración esté en el rango correcto (0.5 a 5.0)
        if (valoracion < 0.5 || valoracion > 5.0) {
            return {
                success: false,
                error: 'La valoración debe estar entre 0.5 y 5.0',
            }
        }

        // Formatear valoración para el backend (asegurar punto decimal)
        const valoracionFormateada = valoracion.toFixed(1).replace(',', '.')
        formData.set('valoracion', valoracionFormateada)

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
            let errorMessage = ''

            try {
                const errorData = errorText ? JSON.parse(errorText) : {}

                // Si hay errores de validación, devolverlos en el formato esperado
                if (errorData.errors) {
                    // Aquí podríamos devolver los errores de validación estructurados si ApiResponse lo soportara mejor
                    // Por ahora devolvemos el primer error o un mensaje genérico
                    const firstError = Object.values(errorData.errors)[0]
                    if (Array.isArray(firstError) && firstError.length > 0) {
                        errorMessage = String(firstError[0])
                    } else {
                        errorMessage = 'Error de validación'
                    }
                } else {
                    errorMessage = errorData.message || errorData.error || errorData.title || 'Error al crear opinión'
                }
            } catch {
                errorMessage = errorText || 'Error al crear opinión'
            }

            console.error('Error al crear opinión:', errorMessage)
            return {
                success: false,
                error: errorMessage,
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
