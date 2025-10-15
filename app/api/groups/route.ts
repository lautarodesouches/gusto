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

        if (!token) {
            return NextResponse.json(
                { error: 'No autorizado: falta token' },
                { status: 401 }
            )
        }

        const body = await req.json()
        const { nombre, descripcion } = body

        if (!nombre || !descripcion) {
            return NextResponse.json(
                { message: 'Nombre y descripción son requeridos' },
                { status: 400 }
            )
        }

        // Llamada al backend
        const response = await fetch(`${API_URL}/Grupo/crear`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ nombre, descripcion }),
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status })
        }

        revalidatePath(ROUTES.MAP)

        return NextResponse.json(data, { status: 200 })
    } catch (err: unknown) {
        console.error(err)
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
