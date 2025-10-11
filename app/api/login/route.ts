import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { firebaseToken } = await req.json()

        if (!firebaseToken) {
            return NextResponse.json(
                { error: 'Falta el token de Firebase' },
                { status: 400 }
            )
        }

        const response = NextResponse.json({
            success: true
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
        console.error('Error al verificar token de Firebase:', error)
        return NextResponse.json(
            { error: 'Token inválido o expirado' },
            { status: 401 }
        )
    }
}
