import { IS_PRODUCTION } from '@/constants'
import { verifyFirebaseToken } from '@/lib/firebaseAdmin'
import { NextResponse } from 'next/server'

interface VerifyTokenRequest {
    firebaseToken: string
}

interface ErrorResponse {
    error: string
    details?: string
}

interface SuccessResponse {
    success: boolean
}

// Constantes
const ERROR_MESSAGES = {
    INVALID_JSON: 'JSON inválido',
    MISSING_TOKEN: 'Falta el token de Firebase',
    INVALID_TOKEN: 'Token inválido o expirado',
    INTERNAL_ERROR: 'Error interno del servidor',
} as const

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 días en segundos

// Parsea el body de la request de forma segura
async function parseRequestBody(req: Request): Promise<unknown> {
    try {
        return await req.json()
    } catch {
        return null
    }
}

// Valida que el body contenga un token válido
function validateRequestBody(body: unknown): body is VerifyTokenRequest {
    if (!body || typeof body !== 'object') return false

    const req = body as Partial<VerifyTokenRequest>
    return Boolean(
        req.firebaseToken &&
            typeof req.firebaseToken === 'string' &&
            req.firebaseToken.trim()
    )
}

// Crea una respuesta de error estandarizada
function createErrorResponse(
    message: string,
    status: number,
    details?: string
): NextResponse<ErrorResponse> {
    return NextResponse.json(
        { error: message, ...(details && { details }) },
        { status }
    )
}

// Crea una respuesta exitosa con cookie de autenticación
function createSuccessResponse(token: string): NextResponse<SuccessResponse> {
    const response = NextResponse.json({ success: true })

    response.cookies.set('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: COOKIE_MAX_AGE,
        secure: IS_PRODUCTION,
    })

    return response
}

// Endpoint para verificar y establecer el token de Firebase
export async function POST(req: Request): Promise<NextResponse> {
    try {
        // 1. Parsear el body
        const body = await parseRequestBody(req)

        if (body === null) {
            return createErrorResponse(ERROR_MESSAGES.INVALID_JSON, 400)
        }

        // 2. Validar que contenga el token
        if (!validateRequestBody(body)) {
            return createErrorResponse(ERROR_MESSAGES.MISSING_TOKEN, 400)
        }

        const { firebaseToken } = body

        // 3. Verificar el token con Firebase
        try {
            await verifyFirebaseToken(firebaseToken)
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Unknown error'
            console.error('Error al verificar token de Firebase:', {
                error: errorMessage,
                timestamp: new Date().toISOString(),
            })
            return createErrorResponse(
                ERROR_MESSAGES.INVALID_TOKEN,
                401,
                errorMessage
            )
        }

        // 4. Token válido - crear respuesta con cookie
        return createSuccessResponse(firebaseToken)
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error'
        console.error('Error inesperado en verificación de token:', {
            error: errorMessage,
            timestamp: new Date().toISOString(),
        })
        return createErrorResponse(
            ERROR_MESSAGES.INTERNAL_ERROR,
            500,
            errorMessage
        )
    }
}
