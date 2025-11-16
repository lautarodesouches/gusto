import { NextResponse } from 'next/server'
import { API_URL } from '@/constants'
import { cookies } from 'next/headers'

// GET /api/usuario/resumen?modo=registro | modo=edicion
export async function GET(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No autorizado: falta token' },
                { status: 401 }
            )
        }

    
        const { searchParams } = new URL(req.url)
        const modo = searchParams.get('modo') || 'registro'

        console.log('[API usuario/resumen] modo enviado →', modo)

       
        const response = await fetch(`${API_URL}/Usuario/resumen?modo=${modo}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            const error = await response.text()
            return NextResponse.json(
                { error },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)

    } catch (error) {
        console.error('Error en /api/usuario/resumen:', error)
        return NextResponse.json(
            { error: 'Error interno' },
            { status: 500 }
        )
    }
}
