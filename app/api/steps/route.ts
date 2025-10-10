import { NextResponse } from 'next/server'
import { API_URL } from '@/constants'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
    try {
        const body = await req.json()

        // Alergias - Condiciones - Gustos
        const { step1, step2, step3 } = body

        // Obtener todas las cookies
        const cookieStore = await cookies()

        // Buscar una cookie específica (por ejemplo, "token")
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No token found' },
                { status: 401 }
            )
        }

        // Database
        // 1
        try {
            await fetch(`${API_URL}/Usuario/restricciones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ids: step1.map((item: { id: number }) => item.id),
                    skip: step1.length === 0,
                }),
            })
        } catch (error) {
            console.error(error)
        }

        // 2
        try {
            await fetch(`${API_URL}/Usuario/condiciones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ids: step2.map((item: { id: number }) => item.id),
                    skip: step2.length === 0,
                }),
            })
        } catch (error) {
            console.error(error)
        }

        // 3
        try {
            await fetch(`${API_URL}/Usuario/gustos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ids: step3.map((item: { id: number }) => item.id),
                    skip: step3.length === 0,
                }),
            })
        } catch (error) {
            console.error(error)
        }

        return NextResponse.json({
            success: true,
        })
    } catch (error) {
        console.error('Error en /api/steps: ', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
