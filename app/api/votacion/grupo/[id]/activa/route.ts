import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Usar valor directo temporalmente para debugging
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5174'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { message: 'No autorizado' },
                { status: 401 }
            )
        }

        const backendUrl = `${API_URL}/Votacion/grupo/${id}/activa`
        
        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        
        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json(
                    { message: 'No hay votación activa' },
                    { status: 404 }
                )
            }
            
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
        console.error('Error en /api/votacion/grupo/[id]/activa:', error)
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
