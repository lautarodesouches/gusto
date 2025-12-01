import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Usar valor directo temporalmente para debugging
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5174'

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { message: 'No autorizado' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { grupoId, restaurantesCandidatos } = body

        // Validar que vengan restaurantes candidatos
        if (!restaurantesCandidatos || !Array.isArray(restaurantesCandidatos) || restaurantesCandidatos.length === 0) {
            return NextResponse.json(
                { message: 'Debe proporcionar al menos un restaurante candidato' },
                { status: 400 }
            )
        }

        const backendUrl = `${API_URL}/Votacion/iniciar`
        
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ 
                grupoId,
                restaurantesCandidatos,
            }),
        })
        
        if (!response.ok) {
            const errorText = await response.text()
            let errorData
            try {
                errorData = JSON.parse(errorText)
            } catch {
                errorData = { message: errorText || response.statusText }
            }
            return NextResponse.json(errorData, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error en /api/votacion/iniciar:', error)
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
