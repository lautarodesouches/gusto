import { NextResponse } from 'next/server'
import { API_URL } from '@/constants'
import { cookies } from 'next/headers'

export async function GET(
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

        // Asumiendo que el backend tiene un endpoint para verificar si es favorito
        // Si no existe, podrías obtener la lista de favoritos y verificar
        const res = await fetch(`${API_URL}/api/Restaurantes/favoritos`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })

        if (!res.ok) {
            // Si no hay endpoint de favoritos, asumir que no es favorito
            return NextResponse.json({ isFavourite: false })
        }

        const favoritos = await res.json()
        const isFavourite = Array.isArray(favoritos) 
            ? favoritos.some((fav: { id?: string; Id?: string }) => 
                (fav.id || fav.Id) === id
            )
            : false

        return NextResponse.json({ isFavourite })
    } catch (error) {
        console.error('Error en /api/restaurante/favorito/verificar/[id]:', error)
        // En caso de error, asumir que no es favorito
        return NextResponse.json({ isFavourite: false })
    }
}

