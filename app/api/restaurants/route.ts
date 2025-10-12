// app/api/restaurants/route.ts
import { NextResponse } from 'next/server'
import { API_URL } from '@/constants'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    // Obtener los parámetros de query
    const nearLat = searchParams.get('near.lat')
    const nearLng = searchParams.get('near.lng')
    const tipo = searchParams.get('tipo')
    const plato = searchParams.get('plato')

    // Construir la URL de la API con query params
    const apiUrl = new URL(`${API_URL}/api/Restaurantes`)

    apiUrl.searchParams.append('radiusMeters', '1000') // Fijo por ahora
    if (nearLat) apiUrl.searchParams.append('near.lat', nearLat)
    if (nearLng) apiUrl.searchParams.append('near.lng', nearLng)
    if (tipo) apiUrl.searchParams.append('tipo', tipo)
    if (plato) apiUrl.searchParams.append('plato', plato)

    // Llamada a la API externa
    const res = await fetch(apiUrl.toString())
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