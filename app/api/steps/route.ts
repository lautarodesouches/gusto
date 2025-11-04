import { NextResponse } from 'next/server'
import { API_URL } from '@/constants'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
    try {
        console.log('=== Iniciando guardado de steps ===')
        
        let body
        try {
            body = await req.json()
        } catch (parseError) {
            console.error('Error parseando body:', parseError)
            return NextResponse.json({ 
                error: 'JSON inválido',
                details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
            }, { status: 400 })
        }

        // Alergias - Condiciones - Gustos
        const { step1, step2, step3 } = body
        
        console.log('Steps recibidos (raw):', { 
            step1Type: typeof step1,
            step1IsArray: Array.isArray(step1),
            step2Type: typeof step2,
            step2IsArray: Array.isArray(step2),
            step3Type: typeof step3,
            step3IsArray: Array.isArray(step3),
            step1, 
            step2, 
            step3 
        })
        
        // Asegurar que los steps sean arrays
        const safeStep1 = Array.isArray(step1) ? step1 : []
        const safeStep2 = Array.isArray(step2) ? step2 : []
        const safeStep3 = Array.isArray(step3) ? step3 : []
        
        console.log('Steps procesados:', {
            step1Length: safeStep1.length,
            step2Length: safeStep2.length,
            step3Length: safeStep3.length,
        })

        // Token
        const cookieStore = await cookies()

        const token = cookieStore.get('token')?.value

        if (!token) {
            console.error('Token no encontrado en cookies')
            return NextResponse.json(
                { error: 'Falta el token' },
                { status: 401 }
            )
        }

        console.log('Token encontrado, enviando step1 (restricciones)...')
        // 1
        const res1 = await fetch(`${API_URL}/Usuario/restricciones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                ids: safeStep1.map((item: { id: number }) => item.id),
                skip: safeStep1.length === 0,
            }),
        })
        
        if (!res1.ok) {
            const errorText = await res1.text()
            console.error('Error en step1 (restricciones):', res1.status, errorText)
            throw new Error(`Error en restricciones: ${res1.status}`)
        }
        console.log('Step1 guardado correctamente')

        console.log('Enviando step2 (condiciones)...')
        // 2
        const res2 = await fetch(`${API_URL}/Usuario/condiciones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                ids: safeStep2.map((item: { id: number }) => item.id),
                skip: safeStep2.length === 0,
            }),
        })
        
        if (!res2.ok) {
            const errorText = await res2.text()
            console.error('Error en step2 (condiciones):', res2.status, errorText)
            throw new Error(`Error en condiciones: ${res2.status}`)
        }
        console.log('Step2 guardado correctamente')

        console.log('Enviando step3 (gustos)...')
        // 3
        const res3 = await fetch(`${API_URL}/Usuario/gustos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                ids: safeStep3.map((item: { id: number }) => item.id),
                skip: safeStep3.length === 0,
            }),
        })
        
        if (!res3.ok) {
            const errorText = await res3.text()
            console.error('Error en step3 (gustos):', res3.status, errorText)
            throw new Error(`Error en gustos: ${res3.status}`)
        }
        console.log('Step3 guardado correctamente')

        console.log('=== Todos los steps guardados exitosamente ===')
        return NextResponse.json({
            success: true,
        })
    } catch (error) {
        console.error('Error en /api/steps: ', error)
        return NextResponse.json({ 
            error: 'Error interno',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
