import { NextResponse } from 'next/server'
import { API_URL } from '@/constants'
import { cookies } from 'next/headers'

export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No autorizado: falta token' },
                { status: 401 }
            )
        }

        const { id } = await context.params

        if (!id) {
            return NextResponse.json(
                { error: 'ID del restaurante es requerido' },
                { status: 400 }
            )
        }

        const res = await fetch(`${API_URL}/api/Restaurantes/favorito/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })

        if (!res.ok) {
            const errorText = await res.text()
            console.error(`Error al agregar favorito (${res.status}):`, errorText)
            return NextResponse.json(
                { error: 'No se pudo agregar el favorito', details: errorText },
                { status: res.status }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error en /api/restaurante/favorito/[id]:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No autorizado: falta token' },
                { status: 401 }
            )
        }

        const { id } = await context.params

        if (!id) {
            return NextResponse.json(
                { error: 'ID del restaurante es requerido' },
                { status: 400 }
            )
        }

        // Asumiendo que el backend tiene un endpoint DELETE para quitar favorito
        // Si no existe, podrías usar el mismo POST y que el backend haga toggle
        const res = await fetch(`${API_URL}/api/Restaurantes/favorito/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })

        if (!res.ok) {
            const errorText = await res.text()
            console.error(`Error al quitar favorito (${res.status}):`, errorText)
            return NextResponse.json(
                { error: 'No se pudo quitar el favorito', details: errorText },
                { status: res.status }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error en /api/restaurante/favorito/[id] DELETE:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

