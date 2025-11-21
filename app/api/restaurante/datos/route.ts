import { NextResponse } from 'next/server'
import { API_URL } from '@/constants'
import { cookies } from 'next/headers'
import type { DatosSolicitudRestauranteBackend, ItemSimpleBackend } from '@/types'

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

        const response = await fetch(`${API_URL}/api/Restaurantes/registro-datos`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        })

        if (!response.ok) {
            const errorText = await response.text().catch(() => '')
            let errorMessage = 'Error al obtener datos de registro'
            
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

        const data: DatosSolicitudRestauranteBackend = await response.json()
        
        // Debug: Log de la respuesta del backend
        console.log('Respuesta del backend:', JSON.stringify(data, null, 2))
        
        // El backend puede devolver con diferentes formatos de nombres
        // Intentar con diferentes variaciones: PascalCase, camelCase, etc.
        // También manejar null/undefined
        const gustos = (data.Gustos || data.gustos || []).filter((item: ItemSimpleBackend | null | undefined): item is ItemSimpleBackend => item !== null && item !== undefined)
        const restricciones = (data.Restricciones || data.restricciones || []).filter((item: ItemSimpleBackend | null | undefined): item is ItemSimpleBackend => item !== null && item !== undefined)
        
        console.log('Gustos encontrados:', gustos.length)
        console.log('Restricciones encontradas:', restricciones.length)
        
        // Mapear la respuesta del backend al formato esperado
        // Backend retorna: { Gustos: [{ Id, Nombre }], Restricciones: [{ Id, Nombre }] }
        // O puede ser: { gustos: [{ id, nombre }], restricciones: [{ id, nombre }] }
        const mappedData = {
            gustos: gustos.map((g: ItemSimpleBackend) => ({
                id: String(g.Id || g.id || ''),
                nombre: g.Nombre || g.nombre || '',
            })),
            restricciones: restricciones.map((r: ItemSimpleBackend) => ({
                id: String(r.Id || r.id || ''),
                nombre: r.Nombre || r.nombre || '',
            })),
        }

        console.log('Datos mapeados:', {
            gustosCount: mappedData.gustos.length,
            restriccionesCount: mappedData.restricciones.length,
        })

        return NextResponse.json(mappedData, { status: 200 })
    } catch (error) {
        console.error('Error en /api/restaurante/datos:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

