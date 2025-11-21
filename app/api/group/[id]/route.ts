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

        console.log(`[API Route] Backend response status: ${response.status}`)
        
        // Handle non-JSON responses (like Forbid())
        let data
        try {
            const text = await response.text()
            console.log(`[API Route] Backend response body:`, text)
            data = text ? JSON.parse(text) : { message: response.statusText || 'Error desconocido' }
        } catch (e) {
            console.error('[API Route] Failed to parse response:', e)
            // If response body is not JSON, create a default error message
            data = { message: response.statusText || 'Error desconocido' }
        }

        if (!response.ok) {
            console.log(`[API Route] Returning error to client:`, data)
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

        if (!users || users.length === 0) {
            return NextResponse.json(
                { message: 'Usuario no encontrado' },
                { status: 404 }
            )
        }

        // tomar el primer usuario encontrado (o adaptarlo según necesidad)
        const user = users[0]

        // enviar invitación al backend real
        const resInvite = await fetch(`${API_URL}/Grupo/${id}/invitar`, {
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
        })

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

// Eliminar grupo
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const response = await fetch(`${API_URL}/Grupo/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error al eliminar grupo' }))
            return NextResponse.json(errorData, { status: response.status })
        }

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (err: unknown) {
        console.error(err)
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
