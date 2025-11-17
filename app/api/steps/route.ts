import { NextResponse } from 'next/server'
import { API_URL } from '@/constants'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
    try {
        let body

        try {
            body = await req.json()
        } catch (parseError) {
            console.error('Error parseando body:', parseError)
            return NextResponse.json(
                {
                    error: 'JSON inválido',
                    details:
                        parseError instanceof Error
                            ? parseError.message
                            : 'Unknown parse error',
                },
                { status: 400 }
            )
        }

        // Alergias - Condiciones - Gustos
        const { step1, step2, step3 } = body

        // Asegurar que los steps sean arrays
        const safeStep1 = Array.isArray(step1) ? step1 : []
        const safeStep2 = Array.isArray(step2) ? step2 : []
        const safeStep3 = Array.isArray(step3) ? step3 : []

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

        // 1
        const res1 = await fetch(`${API_URL}/Usuario/restricciones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                ids: safeStep1.map((item: { id: string }) => item.id),
                skip: safeStep1.length === 0,
            }),
        })

        if (!res1.ok) {
            const errorText = await res1.text()
            console.error(
                'Error en step1 (restricciones):',
                res1.status,
                errorText
            )
            throw new Error(`Error en restricciones: ${res1.status}`)
        }

        // 2
        const res2 = await fetch(`${API_URL}/Usuario/condiciones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                ids: safeStep2.map((item: { id: string }) => item.id),

                skip: safeStep2.length === 0,
            }),
        })

        if (!res2.ok) {
            const errorText = await res2.text()
            console.error(
                'Error en step2 (condiciones):',
                res2.status,
                errorText
            )
            throw new Error(`Error en condiciones: ${res2.status}`)
        }

        // 3
        const res3 = await fetch(`${API_URL}/Usuario/gustos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                ids: safeStep3.map((item: { id: string }) => item.id),

                skip: safeStep3.length === 0,
            }),
        })

        if (!res3.ok) {
            const errorText = await res3.text()
            console.error('Error en step3 (gustos):', res3.status, errorText)
            throw new Error(`Error en gustos: ${res3.status}`)
        }

        const resFinalizar = await fetch(`${API_URL}/Usuario/finalizar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })

        if (!resFinalizar.ok) {
            const errorText = await resFinalizar.text()
            console.error(
                'Error al finalizar registro:',
                resFinalizar.status,
                errorText
            )
        }

        return NextResponse.json({
            success: true,
        })
    } catch (error) {
        console.error('Error en /api/steps: ', error)
        return NextResponse.json(
            {
                error: 'Error interno',
                details:
                    error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}
