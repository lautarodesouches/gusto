import { API_URL } from '@/constants'
import { ROUTES } from '@/routes'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        // Leer el token de las cookies
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        console.log('=== DEBUG API GROUP ===')
        console.log('Token presente:', !!token)
        console.log('API_URL:', API_URL)

        if (!token) {
            console.log('Error: No hay token')
            return NextResponse.json(
                { error: 'No autorizado: falta token' },
                { status: 401 }
            )
        }

        const body = await req.json()
        const { nombre, descripcion } = body
        console.log('Datos recibidos:', { nombre, descripcion })

        if (!nombre || !descripcion) {
            console.log('Error: Faltan datos')
            return NextResponse.json(
                { message: 'Nombre y descripción son requeridos' },
                { status: 400 }
            )
        }

        // Llamada al backend
        const backendUrl = `${API_URL}/Grupo/crear`
        console.log('Llamando a:', backendUrl)
        
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ nombre, descripcion }),
        })

        console.log('Response status del backend:', response.status)
        
        let data
        try {
            data = await response.json()
            console.log('Response data del backend:', data)
        } catch (parseError) {
            console.error('Error parsing JSON response:', parseError)
            const textResponse = await response.text()
            console.log('Raw response:', textResponse)
            throw new Error(`Error parsing response: ${textResponse}`)
        }

        if (!response.ok) {
            // Si es error de límite de grupos (status 402 o 400)
            if ((response.status === 402 || response.status === 400) && (
                data.mensaje?.includes('límite') ||
                data.mensaje?.includes('Límite') ||
                data.message?.includes('Límite de grupos alcanzado') ||
                data.message?.includes('límite') ||
                data.tipoPlan === 'Free'
            )) {
                return NextResponse.json({
                    error: 'LIMITE_GRUPOS_ALCANZADO',
                    message: data.mensaje || data.message,
                    needsPremium: true,
                    tipoPlan: data.tipoPlan,
                    limiteActual: data.limiteActual,
                    gruposActuales: data.gruposActuales,
                    beneficiosPremium: data.beneficiosPremium,
                    urlPago: data.urlPago
                }, { status: 402 })
            }
            return NextResponse.json(data, { status: response.status })
        }

        revalidatePath(ROUTES.MAP)

        return NextResponse.json(data, { status: 200 })
    } catch (err: unknown) {
        console.error('=== ERROR EN API GROUP ===')
        console.error('Error completo:', err)
        console.error('Stack trace:', err instanceof Error ? err.stack : 'No stack trace')
        
        return NextResponse.json(
            { 
                message: 'Error interno del servidor',
                error: err instanceof Error ? err.message : 'Error desconocido',
                details: process.env.NODE_ENV === 'development' ? err : undefined
            },
            { status: 500 }
        )
    }
}
