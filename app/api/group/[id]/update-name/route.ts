import { API_URL } from '@/constants'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const body = await req.json()
        const { nombre } = body

        if (!nombre || !nombre.trim()) {
            return NextResponse.json(
                { error: 'El nombre no puede estar vacío' },
                { status: 400 }
            )
        }

        const response = await fetch(`${API_URL}/Grupo/${id}/nombre`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre: nombre.trim() })
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error al actualizar' }))
            return NextResponse.json(errorData, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data, { status: 200 })
    } catch (err) {
        console.error('Error updating group name:', err)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
