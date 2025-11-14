'use server'

import { cookies } from 'next/headers'
import { verifyFirebaseToken } from '@/lib/firebaseAdmin'
import { ApiResponse } from '@/types'
import { API_URL, IS_PRODUCTION } from '@/constants'

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 días en segundos

const ERROR_MESSAGES = {
    MISSING_TOKEN: 'Token de Firebase faltante',
    MISSING_FIELDS: 'Faltan datos obligatorios',
    INVALID_TOKEN: 'Token inválido o expirado',
    BACKEND_CONNECTION: 'No se pudo conectar con el backend',
    INVALID_BACKEND_RESPONSE: 'Respuesta inválida del backend',
    REGISTRATION_FAILED: 'Error en el registro',
    INTERNAL_ERROR: 'Error interno del servidor',
} as const

interface RegisterUserData {
    nombre: string
    apellido: string
    email: string
    username: string
}

/**
 * Registra un usuario en el backend
 */
async function registerUserInBackend(
    firebaseToken: string,
    userData: RegisterUserData
): Promise<Response> {
    return fetch(`${API_URL}/Usuario/registrar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${firebaseToken}`,
        },
        body: JSON.stringify({
            nombre: userData.nombre.trim(),
            apellido: userData.apellido.trim(),
            email: userData.email.trim(),
            username: userData.username.trim(),
            fotoPerfilUrl: '',
        }),
    })
}

/**
 * Registra un nuevo usuario en el sistema
 * @param firebaseToken - Token de Firebase obtenido del cliente
 * @param userData - Datos del usuario a registrar
 * @returns ApiResponse indicando éxito o error
 */
export async function register(
    firebaseToken: string,
    userData: RegisterUserData
): Promise<ApiResponse<{ usuario?: string }>> {
    try {
        // Validar que el token esté presente
        if (!firebaseToken || typeof firebaseToken !== 'string' || !firebaseToken.trim()) {
            return {
                success: false,
                error: ERROR_MESSAGES.MISSING_TOKEN,
            }
        }

        // Validar campos requeridos
        if (
            !userData.nombre?.trim() ||
            !userData.apellido?.trim() ||
            !userData.email?.trim() ||
            !userData.username?.trim()
        ) {
            return {
                success: false,
                error: ERROR_MESSAGES.MISSING_FIELDS,
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

        // Registrar en el backend
        let backendResponse: Response
        try {
            backendResponse = await registerUserInBackend(firebaseToken, userData)
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Unknown error'
            console.error('Error de conexión con el backend:', {
                error: errorMessage,
                timestamp: new Date().toISOString(),
            })
            return {
                success: false,
                error: ERROR_MESSAGES.BACKEND_CONNECTION,
            }
        }

        // Parsear respuesta del backend
        let backendData: { user?: { usuario?: string }; message?: string }
        try {
            backendData = await backendResponse.json()
        } catch {
            console.error('Respuesta no válida del backend')
            return {
                success: false,
                error: ERROR_MESSAGES.INVALID_BACKEND_RESPONSE,
            }
        }

        // Verificar si el registro fue exitoso
        if (!backendResponse.ok) {
            console.error('Error en registro del backend:', {
                status: backendResponse.status,
                data: backendData,
                timestamp: new Date().toISOString(),
            })
            return {
                success: false,
                error: backendData.message || ERROR_MESSAGES.REGISTRATION_FAILED,
            }
        }

        // Token válido y registro exitoso - establecer cookie
        const cookieStore = await cookies()
        cookieStore.set('token', firebaseToken, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: COOKIE_MAX_AGE,
            secure: IS_PRODUCTION,
        })

        return {
            success: true,
            data: { usuario: backendData.user?.usuario },
        }
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error'
        console.error('Error inesperado en registro:', {
            error: errorMessage,
            timestamp: new Date().toISOString(),
        })
        return {
            success: false,
            error: ERROR_MESSAGES.INTERNAL_ERROR,
        }
    }
}


