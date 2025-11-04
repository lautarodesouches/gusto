import { NextResponse } from 'next/server'
import { API_URL, IS_PRODUCTION } from '@/constants'
import { verifyFirebaseToken } from '@/lib/firebaseAdmin'

interface RegisterRequest {
    nombre: string
    apellido: string
    email: string
    username: string
    firebaseToken: string
}

interface RegisterResponse {
    user?: { usuario: string }
}

interface ErrorResponse {
    error: string
    details?: string
}

// Constantes para mensajes de error
const ERROR_MESSAGES = {
    INVALID_JSON: 'JSON inválido',
    MISSING_TOKEN: 'Token de Firebase faltante',
    MISSING_FIELDS: 'Faltan datos obligatorios',
    INVALID_TOKEN: 'Token inválido o expirado',
    BACKEND_CONNECTION: 'No se pudo conectar con el backend',
    INVALID_BACKEND_RESPONSE: 'Respuesta inválida del backend',
    REGISTRATION_FAILED: 'Error en el registro externo',
    INTERNAL_ERROR: 'Error interno del servidor',
} as const

// Duración de la cookie (7 días en segundos)
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7

// Valida los campos requeridos del body
function validateRequestBody(body: unknown): body is RegisterRequest {
    if (!body || typeof body !== 'object') return false
    
    const req = body as Partial<RegisterRequest>
    
    return Boolean(
        req.firebaseToken &&
        req.nombre?.trim() &&
        req.apellido?.trim() &&
        req.email?.trim() &&
        req.username?.trim()
    )
}

// Crea una respuesta de error estandarizada
function createErrorResponse(message: string, status: number, details?: string): NextResponse<ErrorResponse> {
    return NextResponse.json(
        { error: message, ...(details && { details }) },
        { status }
    )
}

// Parsea el body de la request de forma segura
async function parseRequestBody(req: Request): Promise<unknown> {
    try {
        return await req.json()
    } catch {
        return null
    }
}

// Llama al backend para registrar el usuario
async function registerUserInBackend(
    firebaseToken: string,
    userData: Omit<RegisterRequest, 'firebaseToken'>
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

// Maneja el registro de usuario
export async function POST(req: Request): Promise<NextResponse> {
    try {
        console.log('=== Iniciando proceso de registro ===')
        
        // 1. Parsear el body
        const body = await parseRequestBody(req)
        
        if (body === null) {
            console.error('Body JSON inválido')
            return createErrorResponse(ERROR_MESSAGES.INVALID_JSON, 400)
        }

        console.log('Body parseado correctamente:', {
            hasToken: body && typeof body === 'object' && 'firebaseToken' in body,
            hasNombre: body && typeof body === 'object' && 'nombre' in body,
            hasApellido: body && typeof body === 'object' && 'apellido' in body,
            hasEmail: body && typeof body === 'object' && 'email' in body,
            hasUsername: body && typeof body === 'object' && 'username' in body,
        })

        // 2. Validar campos requeridos
        if (!validateRequestBody(body)) {
            // Verificar específicamente si falta el token
            const hasToken = body && 
                            typeof body === 'object' && 
                            'firebaseToken' in body && 
                            Boolean((body as Partial<RegisterRequest>).firebaseToken)
            
            console.error('Validación fallida, hasToken:', hasToken)
            return createErrorResponse(
                hasToken 
                    ? ERROR_MESSAGES.MISSING_FIELDS 
                    : ERROR_MESSAGES.MISSING_TOKEN,
                400
            )
        }

        // Ahora TypeScript sabe que body es RegisterRequest
        const { nombre, apellido, email, username, firebaseToken } = body

        console.log('Datos validados:', { nombre, apellido, email, username })

        // 3. Verificar token de Firebase
        try {
            console.log('Verificando token de Firebase...')
            await verifyFirebaseToken(firebaseToken)
            console.log('Token de Firebase verificado correctamente')
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            console.error('Error al verificar token de Firebase:', errorMessage)
            return createErrorResponse(ERROR_MESSAGES.INVALID_TOKEN, 401, errorMessage)
        }

        // 4. Registrar en el backend
        let backendResponse: Response
        try {
            console.log('Llamando al backend para registrar usuario...')
            backendResponse = await registerUserInBackend(firebaseToken, {
                nombre,
                apellido,
                email,
                username,
            })
            console.log('Respuesta del backend recibida:', {
                status: backendResponse.status,
                statusText: backendResponse.statusText,
                ok: backendResponse.ok
            })
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            console.error('Error de conexión con el backend:', errorMessage)
            return createErrorResponse(ERROR_MESSAGES.BACKEND_CONNECTION, 502, errorMessage)
        }

        // 5. Parsear respuesta del backend
        let data: RegisterResponse
        try {
            data = await backendResponse.json()
            console.log('Data del backend parseada:', data)
        } catch {
            console.error('Respuesta no válida del backend')
            return createErrorResponse(ERROR_MESSAGES.INVALID_BACKEND_RESPONSE, 502)
        }

        // 6. Verificar si el registro fue exitoso
        if (!backendResponse.ok) {
            console.error('Error en registro del backend:', {
                status: backendResponse.status,
                data,
            })
            return createErrorResponse(
                ERROR_MESSAGES.REGISTRATION_FAILED,
                backendResponse.status
            )
        }

        console.log('Registro exitoso, creando cookie...')
        
        // 7. Crear respuesta con cookie
        const response = NextResponse.json({
            success: true,
            user: data.user?.usuario,
        })

        response.cookies.set('token', firebaseToken, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: COOKIE_MAX_AGE,
            secure: IS_PRODUCTION,
        })

        console.log('=== Registro completado exitosamente ===')
        return response

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error('Error inesperado en /api/register:', errorMessage, error)
        return createErrorResponse(ERROR_MESSAGES.INTERNAL_ERROR, 500, errorMessage)
    }
}