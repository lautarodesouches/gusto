import { API_URL } from '@/constants'
import { NextResponse } from 'next/server'

// Obtener beneficios del plan premium
export async function GET() {
    try {
        console.log('=== DEBUG PAYMENT BENEFITS ===')
        console.log('API_URL:', API_URL)
        
        const url = `${API_URL}/api/Pago/beneficios`
        console.log('Llamando a:', url)
        
        // Llamada al backend para obtener beneficios premium
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        console.log('Response status:', response.status)
        
        const data = await response.json()
        console.log('Response data:', data)

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status })
        }

        return NextResponse.json(data, { status: 200 })
    } catch (err: unknown) {
        console.error('Error al obtener beneficios:', err)
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}