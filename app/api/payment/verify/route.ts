import { API_URL } from '@/constants'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Verificar estado de un pago
export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No autorizado: falta token' },
                { status: 401 }
            )
        }

        const url = new URL(req.url)
        const pagoId = url.searchParams.get('pagoId')

        if (!pagoId) {
            return NextResponse.json(
                { message: 'pagoId es requerido' },
                { status: 400 }
            )
        }

        // Llamada al backend para verificar el pago
        const response = await fetch(`${API_URL}/api/Pago/verificar/${pagoId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status })
        }

        return NextResponse.json(data, { status: 200 })
    } catch (err: unknown) {
        console.error('Error al verificar pago:', err)
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}