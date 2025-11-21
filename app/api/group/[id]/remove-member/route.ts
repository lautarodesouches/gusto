import { API_URL } from '@/constants'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
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
        const { username } = body

        if (!username) {
            return NextResponse.json(
                { error: 'Username requerido' },
                { status: 400 }
            )
        }

        const response = await fetch(`${API_URL}/Grupo/${id}/miembros/${username}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error al eliminar miembro' }))
            return NextResponse.json(errorData, { status: response.status })
        }

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (err) {
        console.error('Error removing member:', err)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
