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
        const valoracionStr = formData.get('valoracion')?.toString()
        // Convertir a número (double) para el backend
        const valoracion = valoracionStr ? parseFloat(valoracionStr) : null
        const opinion = formData.get('opinion')?.toString()
        const titulo = formData.get('titulo')?.toString()
        const fechaVisita = formData.get('fechaVisita')?.toString()
        const motivoVisita = formData.get('motivoVisita')?.toString()

        if (!restauranteId || valoracion === null || isNaN(valoracion)) {
            return NextResponse.json(
                { error: 'Faltan campos requeridos o valoración inválida' },
                { status: 400 }
            )
        }

        const backendFormData = new FormData()
        backendFormData.append('restauranteId', restauranteId)
        // Enviar como string pero el backend lo parseará como double
        backendFormData.append('valoracion', valoracion.toString())
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
            let errorMessage = ''
            let errorData: { errors?: Record<string, string[]>; message?: string; error?: string; title?: string } = {}
            
            try {
                errorData = errorText ? JSON.parse(errorText) : {}
                
                // Si hay errores de validación, solo devolverlos sin mensaje general
                if (errorData.errors) {
                    return NextResponse.json(
                        { errors: errorData.errors },
                        { status: res.status }
                    )
                }
                
                // Si no hay errores de validación, devolver mensaje general
                errorMessage = errorData.message || errorData.error || errorData.title || 'Error al crear opinión'
            } catch {
                if (errorText) {
                    errorMessage = errorText
                } else {
                    errorMessage = 'Error al crear opinión'
                }
            }

            return NextResponse.json(
                { error: errorMessage },
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

