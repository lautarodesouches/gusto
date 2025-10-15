import { API_URL } from '@/constants'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Obtener grupo por ID
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No autorizado: falta token' },
                { status: 401 }
            )
        }

        if (!id) {
            return NextResponse.json(
                { message: 'Falta el parámetro ID' },
                { status: 400 }
            )
        }

        const response = await fetch(`${API_URL}/Grupo/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status })
        }

        return NextResponse.json(data, { status: 200 })
    } catch (err: unknown) {
        console.error(err)
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

// Invitar
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No autorizado: falta token' },
                { status: 401 }
            )
        }

        if (!id) {
            return NextResponse.json(
                { message: 'Falta el parámetro ID' },
                { status: 400 }
            )
        }

        // obtener el query desde el body
        const body = await req.json()
        const { query, mensajePersonalizado } = body

        if (!query) {
            return NextResponse.json(
                { message: 'Falta query para buscar usuario' },
                { status: 400 }
            )
        }

        console.log({ token })

        // Buscar usuario
        const searchRes = await fetch(
            `${API_URL}/Amistad/buscar-usuarios/?q=${query}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )

        if (!searchRes.ok) {
            const errData = await searchRes.json()
            return NextResponse.json(errData, { status: searchRes.status })
        }

        const users = await searchRes.json()

        console.log({ users })

        if (!users || users.length === 0) {
            return NextResponse.json(
                { message: 'Usuario no encontrado' },
                { status: 404 }
            )
        }

        // tomar el primer usuario encontrado (o adaptarlo según necesidad)
        const user = users[0]

        // enviar invitación al backend real
        const resInvite = await fetch(
            `${API_URL}/Grupo/${id}/invitar`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    emailUsuario: user.email,
                    usuarioId: user.id,
                    usuarioUsername: user.username,
                    mensajePersonalizado: mensajePersonalizado || '',
                }),
            }
        )

        const data = await resInvite.json()

        if (!resInvite.ok) {
            return NextResponse.json(data, { status: resInvite.status })
        }

        return NextResponse.json(data, { status: 200 })
    } catch (err: unknown) {
        console.error(err)
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
