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

        const rawData = await response.json()
        
        // El backend devuelve en camelCase: { gustos: [{ id, nombre }], restricciones: [{ id, nombre }] }
        // Intentar ambos formatos por si el backend serializa diferente
        const gustosRaw = (rawData as { Gustos?: unknown[]; gustos?: unknown[] }).Gustos || 
                         (rawData as { Gustos?: unknown[]; gustos?: unknown[] }).gustos || 
                         []
        const restriccionesRaw = (rawData as { Restricciones?: unknown[]; restricciones?: unknown[] }).Restricciones || 
                                (rawData as { Restricciones?: unknown[]; restricciones?: unknown[] }).restricciones || 
                                []
        
        // Asegurarse de que sean arrays
        const gustosArray = Array.isArray(gustosRaw) ? gustosRaw : []
        const restriccionesArray = Array.isArray(restriccionesRaw) ? restriccionesRaw : []
        
        // Mapear la respuesta del backend al formato esperado
        // El backend devuelve { id, nombre } en camelCase
        const mappedData = {
            gustos: gustosArray.map((item) => {
                const typedItem = item as { id?: string | number; Id?: string | number; nombre?: string; Nombre?: string }
                return {
                    id: String(typedItem.id || typedItem.Id || ''),
                    nombre: typedItem.nombre || typedItem.Nombre || '',
                }
            }),
            restricciones: restriccionesArray.map((item) => {
                const typedItem = item as { id?: string | number; Id?: string | number; nombre?: string; Nombre?: string }
                return {
                    id: String(typedItem.id || typedItem.Id || ''),
                    nombre: typedItem.nombre || typedItem.Nombre || '',
                }
            }),
        }

        return NextResponse.json(mappedData, { status: 200 })
    } catch (error) {
        console.error('Error en /api/restaurante/datos:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

