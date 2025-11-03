import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_URL } from '@/constants'
import { revalidatePath } from 'next/cache'
import { ROUTES } from '@/routes'

// Solicitud amistad
export async function POST(req: Request) {
    try {
        // Leer el token de las cookies
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No autorizado: falta token' },
                { status: 401 }
            )
        }

        // Leer el cuerpo del request
        const body = await req.json()

        // Validación básica
        if (!body.UsernameDestino) {
            return NextResponse.json(
                { error: 'Falta el username' },
                { status: 400 }
            )
        }

        // Enviar la solicitud al backend
        const res = await fetch(`${API_URL}/Amistad/enviar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        })

        if (!res.ok) {
            const errorText = await res.text()
            return NextResponse.json(
                { error: `Error del servidor: ${errorText}` },
                { status: res.status }
            )
        }

        revalidatePath(ROUTES.MAP)

        const data = await res.json()
        return NextResponse.json(data, { status: 200 })
    } catch (err) {
        console.error('Error en POST /api/social/friend:', err)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
