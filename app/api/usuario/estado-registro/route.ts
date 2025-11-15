import { API_URL } from '@/constants'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No autorizado: falta token' },
                { status: 401 }
            )
        }

        const res = await fetch(`${API_URL}/usuario/estado-registro`, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) {
            return NextResponse.json(
                { registroCompleto: false, paso: 1 },
                { status: res.status }
            )
        }

        const data = await res.json()
        return NextResponse.json(data)
    } catch (e) {
        console.error(e)
        return NextResponse.json(
            { registroCompleto: false, paso: 1 },
            { status: 500 }
        )
    }
}
