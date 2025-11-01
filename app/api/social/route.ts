import { NextResponse } from 'next/server'
import { API_URL } from '@/constants'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token)
            return NextResponse.json({ error: 'No token' }, { status: 401 })

        // Determinar el endpoint interno que querés llamar
        const url = new URL(req.url)
        const endpoint = url.searchParams.get('endpoint')

        if (!endpoint)
            return NextResponse.json({ error: 'No endpoint' }, { status: 400 })

        const res = await fetch(`${API_URL}/${endpoint}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!res.ok) {
            return NextResponse.json(
                {
                    error: `Error al obtener datos del endpoint`,
                    status: res.status,
                },
                { status: res.status }
            )
        }

        const data = await res.json()

        return NextResponse.json(data)
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
