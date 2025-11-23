import { NextResponse } from 'next/server'
import { API_URL } from '@/constants'
import { cookies } from 'next/headers'

/**
 * Endpoint proxy para refrescar los claims de Firebase del usuario
 * Llama al backend para actualizar el rol en Firebase basado en la BD
 */
export async function POST() {
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

        // Llamar al backend para refrescar los claims
        const response = await fetch(`${API_URL}/Autenticacion/refresh-claims`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return NextResponse.json(
                { error: errorData.message || 'Error al refrescar claims' },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data, { status: 200 })
    } catch (error) {
        console.error('Error en /api/auth/refresh-claims:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

