import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5174'

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader) {
            return NextResponse.json(
                { error: 'No autorizado', isPremium: false },
                { status: 401 }
            )
        }

        const response = await fetch(`${API_URL}/api/Pago/verificar-estado-premium`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: authHeader,
            },
        })

        if (!response.ok) {
            const errorData = await response.json()
            return NextResponse.json(
                { error: errorData.message || 'Error al verificar estado', isPremium: false },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error al verificar estado premium:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor', isPremium: false },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader) {
            return NextResponse.json(
                { error: 'No autorizado', isPremium: false },
                { status: 401 }
            )
        }

        // Endpoint temporal para desarrollo - fuerza la actualización a Premium
        const response = await fetch(`${API_URL}/api/Pago/forzar-premium-dev`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: authHeader,
            },
        })

        if (!response.ok) {
            const errorData = await response.json()
            return NextResponse.json(
                { error: errorData.message || 'Error al actualizar', isPremium: false },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error al actualizar a premium:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor', isPremium: false },
            { status: 500 }
        )
    }
}
