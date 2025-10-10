import { NextResponse } from 'next/server'
import { API_URL } from '@/constants'
import { ResponseRegister } from '@/types'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { nombre, apellido, email, firebaseToken } = body

        if (!firebaseToken) {
            return NextResponse.json(
                { error: 'Token de Firebase faltante' },
                { status: 400 }
            )
        }

        // Validate token
        //const decoded = await admin.auth().verifyIdToken(firebaseToken)
        //console.log({ decoded })

        // Database
        const res = await fetch(`${API_URL}/Usuario/registrar`, {
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
            }),
        })

        const data: ResponseRegister = await res.json()

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
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 días
        })

        return response
    } catch (error) {
        console.error('Error en /api/auth/register:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
