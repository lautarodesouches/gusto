import { NextRequest, NextResponse } from 'next/server'
import { API_URL } from '@/constants'
import { cookies } from 'next/headers'

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
        const { solicitudId, motivoRechazo } = body

        if (!solicitudId) {
            return NextResponse.json(
                { error: 'ID de solicitud requerido' },
                { status: 400 }
            )
        }

        if (!motivoRechazo || motivoRechazo.trim() === '') {
            return NextResponse.json(
                { error: 'El motivo del rechazo es requerido' },
                { status: 400 }
            )
        }

        // El backend espera el motivo como string en el body (no JSON)
        const response = await fetch(`${API_URL}/Admin/rechazar/${solicitudId}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(motivoRechazo), // El backend espera [FromBody] string, así que enviamos el string directamente
        })

        if (!response.ok) {
            const errorText = await response.text().catch(() => '')
            let errorMessage = 'Error al rechazar la solicitud'
            
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
        console.error('Error en /api/admin/rechazar:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

