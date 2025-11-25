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
            try {
                const errorData = await res.json()
                const errorMessage = errorData.message || errorData.error || ''
                
                // Detectar si es error de límite de favoritos (puede venir como 402 o 500)
                const isLimitError = res.status === 402 || 
                    res.status === 500 && (
                        errorMessage.toLowerCase().includes('límite') ||
                        errorMessage.toLowerCase().includes('limite') ||
                        errorMessage.toLowerCase().includes('alcanzado') ||
                        errorMessage.toLowerCase().includes('suscribite')
                    )
                
                if (isLimitError) {
                    // Intentar extraer información del error si está disponible
                    return NextResponse.json(
                        {
                            error: 'LIMITE_FAVORITOS_ALCANZADO',
                            tipoPlan: errorData.plan || errorData.tipoPlan || 'Free',
                            limiteActual: errorData.limite || errorData.limiteActual || 3,
                            favoritosActuales: errorData.actuales || errorData.favoritosActuales || 3,
                            beneficios: errorData.beneficios,
                            linkPago: errorData.linkPago,
                            message: errorMessage,
                        },
                        { status: res.status }
                    )
                }
                
                // Si no es error de límite, devolver error genérico
                return NextResponse.json(
                    { error: errorMessage || 'No se pudo agregar el favorito', details: errorData },
                    { status: res.status }
                )
            } catch {
                // Si no se puede parsear JSON, intentar como texto
                const errorText = await res.text().catch(() => 'Error desconocido')
                console.error(`Error al agregar favorito (${res.status}):`, errorText)
                
                // Verificar si el texto contiene indicadores de límite
                const isLimitError = errorText.toLowerCase().includes('límite') ||
                    errorText.toLowerCase().includes('limite') ||
                    errorText.toLowerCase().includes('alcanzado')
                
                if (isLimitError) {
                    return NextResponse.json(
                        {
                            error: 'LIMITE_FAVORITOS_ALCANZADO',
                            tipoPlan: 'Free',
                            limiteActual: 3,
                            favoritosActuales: 3,
                            message: errorText,
                        },
                        { status: res.status }
                    )
                }
                
                return NextResponse.json(
                    { error: 'No se pudo agregar el favorito', details: errorText },
                    { status: res.status }
                )
            }
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

