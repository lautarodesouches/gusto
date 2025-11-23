import { NextRequest, NextResponse } from 'next/server'
import { API_URL } from '@/constants'
import { cookies } from 'next/headers'

type RouteParams = {
  id: string
}

type RouteContext = {
  params: Promise<RouteParams>
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params

  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado: falta token' },
        { status: 401 }
      )
    }

    const body = await req.json()

    const res = await fetch(`${API_URL}/api/Restaurantes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      let errorMessage = 'Error al actualizar el restaurante'

      try {
        const errorData = await res.json()
        errorMessage =
          errorData.error ||
          errorData.message ||
          `Error ${res.status}: ${res.statusText}`
      } catch {
        const errorText = await res.text().catch(() => '')
        if (errorText) errorMessage = errorText
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('❌ Error al actualizar restaurante:', error)
    return NextResponse.json(
      { error: 'Error interno al actualizar el restaurante' },
      { status: 500 }
    )
  }
}

