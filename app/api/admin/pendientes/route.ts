import { NextResponse } from 'next/server'
import { API_URL } from '@/constants'
import { cookies } from 'next/headers'
import type { SolicitudRestauranteBackend } from '@/types'

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

        const response = await fetch(`${API_URL}/Admin/pendientes`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        })

        if (!response.ok) {
            const errorText = await response.text().catch(() => '')
            let errorMessage = 'Error al obtener solicitudes pendientes'
            
            try {
                const errorData = errorText ? JSON.parse(errorText) : {}
                errorMessage = errorData.message || errorData.error || errorMessage
            } catch {
                if (errorText) {
                    errorMessage = errorText
                }
            }

            return NextResponse.json(
                { error: errorMessage },
                { status: response.status }
            )
        }

        const data: SolicitudRestauranteBackend[] = await response.json()
        
        // Mapear la respuesta del backend al formato esperado
        // Backend retorna: [{ Id, NombreRestaurante, Direccion, UsuarioNombre, UsuarioEmail, imgLogo, FechaCreacionUtc }]
        const mappedData = Array.isArray(data) ? data.map((item: SolicitudRestauranteBackend) => ({
            id: item.Id || item.id || '',
            nombreRestaurante: item.NombreRestaurante || item.nombreRestaurante || '',
            direccion: item.Direccion || item.direccion || '',
            usuarioNombre: item.UsuarioNombre || item.usuarioNombre || '',
            usuarioEmail: item.UsuarioEmail || item.usuarioEmail || '',
            imgLogo: item.imgLogo || '',
            fechaCreacionUtc: item.FechaCreacionUtc || item.fechaCreacionUtc || '',
        })) : []

        return NextResponse.json(mappedData, { status: 200 })
    } catch (error) {
        console.error('Error en /api/admin/pendientes:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

