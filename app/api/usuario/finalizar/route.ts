import { NextResponse } from 'next/server'
import { API_URL } from '@/constants'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No autorizado: falta token' },
                { status: 401 }
            )
        }

        const response = await fetch(`${API_URL}/Usuario/finalizar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            const errorText = await response.text()
            return NextResponse.json(
                { error: errorText },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error en /api/usuario/finalizar:', error)
        return NextResponse.json(
            { error: 'Error interno' },
            { status: 500 }
        )
    }
}

