import { NextResponse } from 'next/server'
import { API_URL } from '@/constants'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No autorizado: falta token' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(req.url)
        const texto = searchParams.get('texto')

        if (!texto || texto.trim() === '') {
            return NextResponse.json(
                { error: 'El parámetro "texto" es requerido' },
                { status: 400 }
            )
        }

        // Llamar al endpoint del backend
        const apiUrl = new URL(`${API_URL}/api/Restaurantes/buscar`)
        apiUrl.searchParams.append('texto', texto.trim())

        const res = await fetch(apiUrl.toString(), {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })

        if (!res.ok) {
            const errorText = await res.text()
            console.error(`Error al buscar restaurantes (${res.status}):`, errorText)
            return NextResponse.json(
                { error: 'No se pudieron buscar los restaurantes', details: errorText },
                { status: res.status }
            )
        }

        const data = await res.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error en /api/restaurante/buscar:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

