import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5174'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        console.log('[API] Seleccionar ganador - votacionId:', id)
        
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
        }
        
        const body = await request.json()
        console.log('[API] Request body:', body)

        const res = await fetch(
            `${API_URL}/votacion/${id}/seleccionar-ganador`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            }
        )

        console.log('[API] Backend response status:', res.status)

        if (!res.ok) {
            const error = await res.json()
            console.error('[API] Backend error:', error)
            return NextResponse.json(error, { status: res.status })
        }

        const data = await res.json()
        console.log('[API] Success response:', data)
        return NextResponse.json(data)
    } catch (error) {
        console.error('[API] Error:', error)
        return NextResponse.json(
            { message: 'Error al seleccionar ganador' },
            { status: 500 }
        )
    }
}
