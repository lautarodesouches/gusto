import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Usar valor directo temporalmente para debugging
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5174'

console.log('[ROUTE LOADED] /api/votacion/iniciar - API_URL:', API_URL)

export async function POST(request: NextRequest) {
    try {
        console.log('[API] POST /api/votacion/iniciar - Inicio')
        
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            console.log('[API] No token found')
            return NextResponse.json(
                { message: 'No autorizado' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { grupoId } = body
        console.log('[API] grupoId:', grupoId)

        const backendUrl = `${API_URL}/Votacion/iniciar`
        console.log('[API] Calling backend:', backendUrl)
        
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ grupoId }),
        })

        console.log('[API] Backend response status:', response.status)
        
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
