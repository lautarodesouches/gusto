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
        const { solicitudId } = body

        if (!solicitudId) {
            return NextResponse.json(
                { error: 'ID de solicitud requerido' },
                { status: 400 }
            )
        }

        const response = await fetch(`${API_URL}/Admin/solicitudes/aprobar/${solicitudId}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorText = await response.text().catch(() => '')
            let errorMessage = 'Error al aceptar la solicitud'
            
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
        console.error('Error en /api/admin/aceptar:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

