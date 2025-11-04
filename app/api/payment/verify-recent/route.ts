import { API_URL } from '@/constants'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Verificar si hay un pago reciente aprobado para el usuario
export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { aprobado: false, message: 'No autorizado' },
                { status: 401 }
            )
        }

        if (!API_URL) {
            return NextResponse.json(
                { aprobado: false, message: 'Error de configuración' },
                { status: 500 }
            )
        }

        // Llamar al backend para verificar el pago
        const response = await fetch(`${API_URL}/api/Pago/verificar-reciente`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            return NextResponse.json(
                { aprobado: false },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data, { status: 200 })
    } catch (err: unknown) {
        console.error('Error verificando pago reciente:', err)
        return NextResponse.json(
            { aprobado: false, message: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
