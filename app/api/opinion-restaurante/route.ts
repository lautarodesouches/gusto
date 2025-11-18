import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_URL } from '@/constants'

export async function POST(req: Request) {
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

        const restauranteId = formData.get('restauranteId')?.toString()
        const valoracion = formData.get('valoracion')?.toString()
        const opinion = formData.get('opinion')?.toString()
        const titulo = formData.get('titulo')?.toString()
        const fechaVisita = formData.get('fechaVisita')?.toString()
        const motivoVisita = formData.get('motivoVisita')?.toString()

        if (!restauranteId || !valoracion) {
            return NextResponse.json(
                { error: 'Faltan campos requeridos' },
                { status: 400 }
            )
        }

        const backendFormData = new FormData()
        backendFormData.append('restauranteId', restauranteId)
        backendFormData.append('valoracion', valoracion)
        if (opinion) backendFormData.append('opinion', opinion)
        if (titulo) backendFormData.append('titulo', titulo)
        if (fechaVisita) backendFormData.append('fechaVisita', fechaVisita)
        if (motivoVisita) backendFormData.append('motivoVisita', motivoVisita)

        const imagenes = formData.getAll('imagenes')
        imagenes.forEach((imagen) => {
            if (imagen instanceof File) {
                backendFormData.append('imagenes', imagen)
            }
        })

        const res = await fetch(`${API_URL}/api/OpinionRestaurante`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: backendFormData,
        })

        if (!res.ok) {
            const errorText = await res.text().catch(() => '')
            console.error('Error al crear opinión:', errorText)
            return NextResponse.json(
                { error: 'Error al crear opinión' },
                { status: res.status }
            )
        }

        const contentType = res.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
            const data = await res.json()
            return NextResponse.json(data)
        } else {
            const text = await res.text()
            return NextResponse.json({ message: text || 'Valoracion registrada' })
        }
    } catch (error) {
        console.error('Error en /api/opinion-restaurante:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

