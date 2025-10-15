import { API_URL } from '@/constants'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Obtener grupo por ID
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No autorizado: falta token' },
                { status: 401 }
            )
        }

        if (!id) {
            return NextResponse.json(
                { message: 'Falta el parámetro ID' },
                { status: 400 }
            )
        }

        const response = await fetch(`${API_URL}/Grupo/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        const data = await response.json()

        console.log({ data })

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status })
        }

        return NextResponse.json(data, { status: 200 })
    } catch (err: unknown) {
        console.error(err)
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
