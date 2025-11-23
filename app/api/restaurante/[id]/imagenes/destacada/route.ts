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

    const formData = await req.formData()
    const backendFormData = new FormData()

    formData.forEach((value, key) => {
      backendFormData.append(key, value)
    })

    const response = await fetch(
      `${API_URL}/api/Restaurantes/${id}/imagenes/destacada`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: backendFormData,
      }
    )

    if (!response.ok) {
      let errorMessage = 'Error al actualizar imagen destacada'

      try {
        const errorData = await response.json()
        errorMessage =
          errorData.error ||
          errorData.message ||
          `Error ${response.status}: ${response.statusText}`
      } catch {
        const errorText = await response.text().catch(() => '')
        if (errorText) errorMessage = errorText
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error(
      'Error en /api/restaurante/[id]/imagenes/destacada:',
      error
    )
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
