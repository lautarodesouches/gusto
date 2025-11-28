'use server'

import { cookies } from 'next/headers'
import { verifyFirebaseToken } from '@/lib/firebaseAdmin'
import { ApiResponse } from '@/types'
import { IS_PRODUCTION, API_URL } from '@/constants'

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 días en segundos

const ERROR_MESSAGES = {
    MISSING_TOKEN: 'Falta el token de Firebase',
    INVALID_TOKEN: 'Token inválido o expirado',
    INTERNAL_ERROR: 'Error interno del servidor',
} as const

/**
 * Verifica el token de Firebase y establece la cookie de autenticación
 * @param firebaseToken - Token de Firebase obtenido del cliente
 * @returns ApiResponse indicando éxito o error
 */
export async function login(
    firebaseToken: string
): Promise<ApiResponse<null>> {
    try {
        // Validar que el token esté presente
        if (!firebaseToken || typeof firebaseToken !== 'string' || !firebaseToken.trim()) {
            return {
                success: false,
                error: ERROR_MESSAGES.MISSING_TOKEN,
            }
        }

        // Verificar el token con Firebase Admin
        try {
            await verifyFirebaseToken(firebaseToken)
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Unknown error'
            console.error('Error al verificar token de Firebase:', {
                error: errorMessage,
                timestamp: new Date().toISOString(),
            })
            return {
                success: false,
                error: ERROR_MESSAGES.INVALID_TOKEN,
            }
        }

        // Token válido - Verificar si el usuario existe en el backend
        try {
            const userResponse = await fetch(`${API_URL}/Usuario/me`, {
                headers: {
                    Authorization: `Bearer ${firebaseToken}`,
                },
            })

            if (!userResponse.ok) {
                if (userResponse.status === 404) {
                    return {
                        success: false,
                        error: 'Usuario no registrado. Por favor regístrate primero.',
                    }
                }
                throw new Error('Error al verificar usuario en backend')
            }
        } catch (error) {
            console.error('Error verificando usuario en backend:', error)
            return {
                success: false,
                error: 'Error al verificar tu cuenta. Intenta nuevamente.',
            }
        }

        // Usuario existe - establecer cookie
        const cookieStore = await cookies()
        cookieStore.set('token', firebaseToken, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: COOKIE_MAX_AGE,
            secure: IS_PRODUCTION,
        })

        return { success: true, data: null }
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error'
        console.error('Error inesperado en login:', {
            error: errorMessage,
            timestamp: new Date().toISOString(),
        })
        return {
            success: false,
            error: ERROR_MESSAGES.INTERNAL_ERROR,
        }
    }
}

/**
 * Elimina la cookie de autenticación
 * @returns ApiResponse indicando éxito o error
 */
export async function logout(): Promise<ApiResponse<null>> {
    try {
        const cookieStore = await cookies()
        cookieStore.delete('token')

        return { success: true, data: null }
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error'
        console.error('Error inesperado en logout:', {
            error: errorMessage,
            timestamp: new Date().toISOString(),
        })
        return {
            success: false,
            error: ERROR_MESSAGES.INTERNAL_ERROR,
        }
    }
}

