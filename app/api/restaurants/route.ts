// app/api/restaurants/route.ts
import { NextResponse } from 'next/server'
import { API_URL } from '@/constants'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
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

        const { searchParams } = new URL(req.url)

        // Obtener los parámetros de query
        const nearLat = searchParams.get('near.lat')
        const nearLng = searchParams.get('near.lng')
        const gustos = searchParams.get('gustos')
        const rating = searchParams.get('rating')
        const radius = searchParams.get('radius')

        // Construir la URL de la API con query params
        const apiUrl = new URL(`${API_URL}/api/Restaurantes`)

        apiUrl.searchParams.append('top', '200')
        apiUrl.searchParams.append('radiusMeters', radius || '3000')

        if (nearLat) apiUrl.searchParams.append('near.lat', nearLat)
        if (nearLng) apiUrl.searchParams.append('near.lng', nearLng)

        if (gustos) apiUrl.searchParams.append('gustos', gustos)
        if (rating) apiUrl.searchParams.append('rating', rating)

        // Llamada a la API externa
        const res = await fetch(apiUrl.toString(), {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })

        if (!res.ok) {
            console.error('Error al traer restaurantes:', await res.text())
            return NextResponse.json(
                { error: 'No se pudieron obtener los restaurantes' },
                { status: res.status }
            )
        }

        const data = await res.json()

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error en /api/restaurants:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
