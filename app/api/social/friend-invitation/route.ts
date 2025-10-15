import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { API_URL } from '@/constants'
import { ROUTES } from '@/routes'

export async function POST(req: Request) {
    try {
        // Leer token de cookies
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        // Leer body
        const { solicitudId, action } = await req.json()
        if (!solicitudId || !['aceptar', 'rechazar'].includes(action)) {
            return NextResponse.json(
                { error: 'Solicitud o acción inválida' },
                { status: 400 }
            )
        }

        // Llamada al backend
        const res = await fetch(`${API_URL}/Amistad/${solicitudId}/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })

        if (!res.ok) {
            const text = await res.text()
            return NextResponse.json(
                { error: text || 'Error del servidor' },
                { status: res.status }
            )
        }

        // Revalidar página de solicitudes de amistad
        revalidatePath(ROUTES.MAP)

        return NextResponse.json({ ok: true })
    } catch (err) {
        console.error(err)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
