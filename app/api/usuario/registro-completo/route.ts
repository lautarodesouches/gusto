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

        // Llamar al endpoint del backend que verifica si el registro está completo
        // Asumiendo que el backend tiene un endpoint para esto
        // Si no existe, podemos verificar llamando a /Usuario/resumen y verificando que tenga gustos
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
        
        // Consideramos el registro completo si tiene al menos 3 gustos
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

