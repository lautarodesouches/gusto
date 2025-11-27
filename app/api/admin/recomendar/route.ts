import { NextRequest, NextResponse } from 'next/server'
import { API_URL } from '@/constants'
import { cookies } from 'next/headers'

export async function POST(_req: NextRequest) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No autorizado: falta token' },
                { status: 401 }
            )
        }

        // Llamar al endpoint del backend - ajustar la ruta según tu backend
        const response = await fetch(`${API_URL}/api/Notificacion/recomendar`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorText = await response.text().catch(() => '')
            let errorMessage = 'Error al enviar recomendaciones'
            
            try {
                const errorData = errorText ? JSON.parse(errorText) : {}
                errorMessage = errorData.message || errorData.error || errorMessage
            } catch {
                if (errorText) {
                    errorMessage = errorText
                }
            }

            return NextResponse.json(
                { error: errorMessage },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data, { status: 200 })
    } catch (error) {
        console.error('Error en /api/admin/recomendar:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
