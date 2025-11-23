import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Endpoint para cerrar sesión - elimina la cookie de autenticación
 */
export async function POST() {
    try {
        const cookieStore = await cookies()
        cookieStore.delete('token')

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        console.error('Error en /api/logout:', error)
        return NextResponse.json(
            { error: 'Error al cerrar sesión' },
            { status: 500 }
        )
    }
}

