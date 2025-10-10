import { NextResponse } from 'next/server'
import { API_URL } from '@/constants'
import { ResponseRegister } from '@/types'

export async function POST(req: Request) {
    try {
        const body = await req.json()

        // Alergias - Condiciones - Gustos
        const { step1, step2, step3 } = body

        // get token from cookies
        const token = req.headers.get('token')?.split(' ')[1]
        console.log({ token })

        if (!token) {
            return NextResponse.redirect('/auth/register/')
        }

        // Database
        const res = await fetch(`${API_URL}/Usuario/gustos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                ids: [],
                skip: false,
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
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 días
        })

        return response
    } catch (error) {
        console.error('Error en /api/steps: ', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
