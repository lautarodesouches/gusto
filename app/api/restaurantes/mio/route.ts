import { NextResponse } from 'next/server'
import { API_URL } from '@/constants'
import { cookies } from 'next/headers'

/**
 * Endpoint para obtener el restaurante del dueño actual
 */
export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No autorizado: falta token' },
                { status: 401 }
            )
        }

        if (!API_URL) {
            return NextResponse.json(
                { error: 'Error de configuración: API_URL no definida' },
                { status: 500 }
            )
        }

        // Llamar al backend para obtener el restaurante del dueño
        const response = await fetch(`${API_URL}/api/Restaurantes/mio`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return NextResponse.json(
                { error: errorData.message || 'Error al obtener restaurante' },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data, { status: 200 })
    } catch (error) {
        console.error('Error en /api/restaurantes/mio:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

