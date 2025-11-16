import { NextResponse } from 'next/server'
import { API_URL } from '@/constants'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No autorizado: falta token' },
                { status: 401 }
            )
        }

        const body = await req.json()
        const { ids, skip } = body

        // Asegurar que ids sea siempre un array
        const safeIds = Array.isArray(ids) ? ids : []
        
        console.log('[API Gustos] Enviando al backend:', {
            ids: safeIds,
            idsLength: safeIds.length,
            skip,
            skipType: typeof skip
        })

        const response = await fetch(`${API_URL}/Usuario/gustos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ids: safeIds, skip }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            return NextResponse.json(
                { error: errorText },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error en /api/usuario/gustos:', error)
        return NextResponse.json(
            { error: 'Error interno' },
            { status: 500 }
        )
    }
}

export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No autorizado: falta token' },
                { status: 401 }
            )
        }

        const body = await req.json()
        const { ids, skip } = body

        console.log('[API Gustos PUT] Recibido del frontend:', {
            ids,
            idsType: typeof ids,
            idsIsArray: Array.isArray(ids),
            idsLength: Array.isArray(ids) ? ids.length : 0,
            skip,
            skipType: typeof skip
        })

       
       type IdInput = string | number | { id: string | number }

const safeIds: string[] = Array.isArray(ids)
    ? ids
        .map((i: IdInput) => {
            if (typeof i === 'object' && i !== null && 'id' in i) {
                return i.id
            }
            return i
        })
        .map((id: string | number) => String(id))
        .filter((id: string) => id.trim().length > 0)
    : []


       
const response = await fetch(`${API_URL}/Gusto/gustos`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ ids: safeIds, skip }),
});


        console.log('[API Gustos PUT] Respuesta del backend:', {
            status: response.status,
            ok: response.ok
        })

        if (!response.ok) {
            const errorText = await response.text()
            return NextResponse.json(
                { error: errorText },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error en /api/usuario/gustos PUT:', error)
        return NextResponse.json(
            { error: 'Error interno' },
            { status: 500 }
        )
    }
}



