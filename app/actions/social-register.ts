'use server'

import { cookies } from 'next/headers'
import { verifyFirebaseToken } from '@/lib/firebaseAdmin'
import { ApiResponse } from '@/types'
import { API_URL, IS_PRODUCTION } from '@/constants'

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 días en segundos

const ERROR_MESSAGES = {
    MISSING_TOKEN: 'Token de Firebase faltante',
    INVALID_TOKEN: 'Token inválido o expirado',
    BACKEND_CONNECTION: 'No se pudo conectar con el backend',
    INTERNAL_ERROR: 'Error interno del servidor',
} as const

interface SocialLoginData {
    nombre: string
    apellido: string
    email: string
    username: string
}

async function registerUserInBackend(
    firebaseToken: string,
    userData: SocialLoginData
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

export async function socialRegister(
    firebaseToken: string,
    userData: SocialLoginData
): Promise<ApiResponse<{ isNewUser: boolean }>> {
    try {
        if (!firebaseToken) {
            return { success: false, error: ERROR_MESSAGES.MISSING_TOKEN }
        }

        try {
            await verifyFirebaseToken(firebaseToken)
        } catch (error) {
            console.error('Error verifying token:', error)
            return { success: false, error: ERROR_MESSAGES.INVALID_TOKEN }
        }

        // Intentar registrar al usuario
        let backendResponse = await registerUserInBackend(firebaseToken, userData)
        let isNewUser = true

        if (!backendResponse.ok) {
            const data = await backendResponse.json().catch(() => ({}))
            const detail = (data.detail || '').toLowerCase()
            const message = (data.message || '').toLowerCase()

            // Si el email ya existe, es un login exitoso
            if (
                detail.includes('email') ||
                detail.includes('correo') ||
                message.includes('email') ||
                message.includes('correo')
            ) {
                isNewUser = false
            }
            // Si el username ya existe, intentamos con uno nuevo
            else if (
                detail.includes('username') ||
                detail.includes('usuario') ||
                message.includes('username') ||
                message.includes('usuario')
            ) {
                // Generar nuevo username con 4 dígitos aleatorios
                const randomSuffix = Math.floor(1000 + Math.random() * 9000)
                const newUserData = {
                    ...userData,
                    username: `${userData.username}${randomSuffix}`
                }

                backendResponse = await registerUserInBackend(firebaseToken, newUserData)

                if (!backendResponse.ok) {
                    // Si falla de nuevo, asumimos error real o login si es por email
                    const retryData = await backendResponse.json().catch(() => ({}))
                    const retryDetail = (retryData.detail || '').toLowerCase()

                    if (retryDetail.includes('email') || retryDetail.includes('correo')) {
                        isNewUser = false
                    } else {
                        return {
                            success: false,
                            error: retryData.message || 'Error al registrar usuario con red social'
                        }
                    }
                }
            } else {
                return {
                    success: false,
                    error: data.message || 'Error desconocido en el registro'
                }
            }
        }

        // Establecer cookie
        const cookieStore = await cookies()
        cookieStore.set('token', firebaseToken, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: COOKIE_MAX_AGE,
            secure: IS_PRODUCTION,
        })

        return { success: true, data: { isNewUser } }

    } catch (error) {
        console.error('Error in socialRegister:', error)
        return { success: false, error: ERROR_MESSAGES.INTERNAL_ERROR }
    }
}
