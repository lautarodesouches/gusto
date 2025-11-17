import { NextResponse } from 'next/server'
import { API_URL } from '@/constants'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No autorizado: falta token' },
                { status: 401 }
            )
        }

      
        const response = await fetch(`${API_URL}/Usuario/resumen`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            return NextResponse.json(
                { registroCompleto: false },
                { status: 200 }
            )
        }

        const data = await response.json()
        
     
        const registroCompleto = data.gustos && Array.isArray(data.gustos) && data.gustos.length >= 3

        return NextResponse.json({ registroCompleto })
    } catch (error) {
        console.error('Error en /api/usuario/registro-completo:', error)
        return NextResponse.json(
            { registroCompleto: false },
            { status: 200 }
        )
    }
}

