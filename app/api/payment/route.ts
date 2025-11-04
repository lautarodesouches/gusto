import { API_URL } from '@/constants'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Crear preferencia de pago con MercadoPago
export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No autorizado: falta token' },
                { status: 401 }
            )
        }

        const body = await req.json()
        const { email, nombreCompleto } = body

        if (!email || !nombreCompleto) {
            return NextResponse.json(
                { message: 'Email y nombre completo son requeridos' },
                { status: 400 }
            )
        }

        console.log('Creando pago con:', { email, nombreCompleto })
        console.log('API_URL:', API_URL)
        console.log('Token presente:', !!token)

        if (!API_URL) {
            console.error('API_URL no está configurada')
            return NextResponse.json(
                { message: 'Error de configuración: API_URL no definida' },
                { status: 500 }
            )
        }

        // Llamada al backend para crear preferencia de pago (usando endpoint de prueba)
        const response = await fetch(`${API_URL}/api/Pago/crear-test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                usuarioId: 'test-user',
                email, 
                nombreCompleto 
            }),
        })

        const data = await response.json()
        console.log('Response del backend pago:', response.status, data)

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status })
        }

        // Para el endpoint de prueba, la respuesta está en data.data
        const responseData = data.success ? data.data : data;
        return NextResponse.json(responseData, { status: 200 })
    } catch (err: unknown) {
        console.error('Error al crear pago:', err)
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}