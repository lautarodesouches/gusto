import { NextResponse } from 'next/server'
import { API_URL } from '@/constants'
//import { verifyFirebaseToken } from '@/lib/firebaseAdmin'

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

export async function POST(req: Request) {
    try {
        // Get body
        let body: RegisterRequest
        try {
            body = await req.json()
        } catch {
            return NextResponse.json(
                { error: 'JSON inválido' },
                { status: 400 }
            )
        }

        const { nombre, apellido, email, username, firebaseToken } = body

        // Validate
        if (!firebaseToken) {
            return NextResponse.json(
                { error: 'Token de Firebase faltante' },
                { status: 400 }
            )
        }
        if (!nombre || !apellido || !email) {
            return NextResponse.json(
                { error: 'Faltan datos obligatorios' },
                { status: 400 }
            )
        }

        // Verify token
        /*
        try {
            await verifyFirebaseToken(firebaseToken)
        } catch (err) {
            console.error('Token inválido o expirado:', err)
            return NextResponse.json(
                { error: 'Token inválido o expirado' },
                { status: 401 }
            )
        }
        */

        // Backend
        let res: Response
        try {
            res = await fetch(`${API_URL}/Usuario/registrar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${firebaseToken}`,
                },
                body: JSON.stringify({
                    nombre,
                    apellido,
                    email,
                    fotoPerfilUrl: '',
                    username
                }),
            })
        } catch (err) {
            console.error('Error de conexión con el backend:', err)
            return NextResponse.json(
                { error: 'No se pudo conectar con el backend' },
                { status: 502 }
            )
        }

        // Response
        let data: RegisterResponse
        try {
            data = await res.json()
        } catch {
            return NextResponse.json(
                { error: 'Respuesta inválida del backend' },
                { status: 502 }
            )
        }

        if (!res.ok) {
            console.error('Error en registro externo:', data)
            return NextResponse.json(
                { error: 'Error en el registro externo' },
                { status: res.status }
            )
        }

        // Cookie
        const response = NextResponse.json({
            success: true,
            user: data.user?.usuario,
        })

        response.cookies.set('token', firebaseToken, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 días
            secure: process.env.NODE_ENV === 'production',
        })

        return response
    } catch (error) {
        console.error('Error inesperado en /api/register:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
