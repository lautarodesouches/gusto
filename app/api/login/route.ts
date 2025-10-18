import { IS_PRODUCTION } from '@/constants'
import { verifyFirebaseToken } from '@/lib/firebaseAdmin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        // Get token
        const { firebaseToken } = await req.json()

        // Validate
        if (!firebaseToken) {
            return NextResponse.json(
                { error: 'Falta el token de Firebase' },
                { status: 400 }
            )
        }

        // Verify
        try {
            await verifyFirebaseToken(firebaseToken)
        } catch (err) {
            console.error('Token inválido o expirado:', err)
            return NextResponse.json(
                { error: 'Token inválido o expirado' },
                { status: 401 }
            )
        }

        const response = NextResponse.json({
            success: true,
        })

        // Set cookie
        response.cookies.set('token', firebaseToken, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 días
            secure: IS_PRODUCTION,
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
