import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_URL } from '@/constants'

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

    const { searchParams } = new URL(req.url)
    const nearLat = searchParams.get('near.lat')
    const nearLng = searchParams.get('near.lng')
    const radius = searchParams.get('radiusMeters') ?? '2000'
    const top = searchParams.get('top') ?? '30'

      const { id: grupoId } = await context.params

    const apiUrl = new URL(`${API_URL}/Grupo/Restaurantes/${grupoId}`)

    apiUrl.searchParams.append('radiusMeters', radius)
    apiUrl.searchParams.append('top', top)
    if (nearLat) apiUrl.searchParams.append('near.lat', nearLat)
    if (nearLng) apiUrl.searchParams.append('near.lng', nearLng)

    console.log('🔗 Llamando a backend:', apiUrl.href)

    const res = await fetch(apiUrl.toString(), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('Error al traer restaurantes del grupo:', text)
      return NextResponse.json(
        { error: 'No se pudieron obtener los restaurantes del grupo' },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error en /api/group/[id]/restaurants:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
