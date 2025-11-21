import { NextResponse } from 'next/server'
import { API_URL } from '@/constants'
import { cookies } from 'next/headers'
import type { SolicitudRestauranteDetalleBackend } from '@/types'

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No autorizado: falta token' },
                { status: 401 }
            )
        }

        const { id } = await params

        if (!id) {
            return NextResponse.json(
                { error: 'ID de solicitud requerido' },
                { status: 400 }
            )
        }

        const response = await fetch(`${API_URL}/Admin/${id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        })

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json(
                    { error: 'Solicitud no encontrada' },
                    { status: 404 }
                )
            }

            const errorText = await response.text().catch(() => '')
            let errorMessage = 'Error al obtener detalles de la solicitud'
            
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

        const data: SolicitudRestauranteDetalleBackend = await response.json()
        
        // El backend puede devolver los datos en PascalCase o camelCase
        const dataAny = data as unknown as Record<string, unknown>
        
        // Parsear horarios desde HorariosJson o Horarios
        let horariosParsed: Array<{
            dia: string
            cerrado: boolean
            desde?: string | null
            hasta?: string | null
        }> = []

        // Primero intentar parsear desde HorariosJson (string JSON)
        const horariosJson = data.HorariosJson ?? (dataAny.horariosJson as string | undefined)
        if (horariosJson && typeof horariosJson === 'string' && horariosJson.trim() !== '') {
            try {
                const parsed = JSON.parse(horariosJson)
                if (Array.isArray(parsed) && parsed.length > 0) {
                    horariosParsed = parsed.map((h: {
                        dia?: string
                        Dia?: string
                        cerrado?: boolean
                        Cerrado?: boolean
                        desde?: string | null
                        Desde?: string | null
                        hasta?: string | null
                        Hasta?: string | null
                    }) => ({
                        dia: (h.Dia || h.dia || '').trim(),
                        cerrado: h.Cerrado ?? h.cerrado ?? false,
                        desde: (h.Desde ?? h.desde) || null,
                        hasta: (h.Hasta ?? h.hasta) || null,
                    })).filter(h => h.dia !== '') // Filtrar horarios sin día
                }
            } catch {
                // Error al parsear horariosJson, intentar con Horarios array
            }
        }

        // Si no se pudo parsear desde JSON, intentar desde el array Horarios
        if (horariosParsed.length === 0) {
            const horariosArray = data.Horarios ?? (dataAny.horarios as unknown)
            if (Array.isArray(horariosArray) && horariosArray.length > 0) {
                horariosParsed = horariosArray
                    .map((h: {
                        Dia?: string
                        dia?: string
                        Cerrado?: boolean
                        cerrado?: boolean
                        Desde?: string | null
                        desde?: string | null
                        Hasta?: string | null
                        hasta?: string | null
                    }) => ({
                        dia: ((h.Dia || h.dia) || '').trim(),
                        cerrado: h.Cerrado ?? h.cerrado ?? false,
                        desde: (h.Desde ?? h.desde) || null,
                        hasta: (h.Hasta ?? h.hasta) || null,
                    }))
                    .filter(h => h.dia !== '') // Filtrar horarios sin día
            }
        }
        
        // Función helper para obtener un string de un campo (PascalCase o camelCase)
        const getStringValue = (pascalKey: string, camelKey: string): string => {
            const pascalValue = dataAny[pascalKey]
            const camelValue = dataAny[camelKey]
            
            if (typeof pascalValue === 'string' && pascalValue) return pascalValue
            if (typeof camelValue === 'string' && camelValue) return camelValue
            return ''
        }
        
        // Función helper para obtener un número o null
        const getNumberValue = (pascalKey: string, camelKey: string): number | null => {
            const pascalValue = dataAny[pascalKey]
            const camelValue = dataAny[camelKey]
            
            if (typeof pascalValue === 'number') return pascalValue
            if (typeof camelValue === 'number') return camelValue
            return null
        }
        
        // Función helper para obtener un array
        const getArrayValue = <T>(pascalKey: string, camelKey: string): T[] => {
            const pascalValue = dataAny[pascalKey]
            const camelValue = dataAny[camelKey]
            
            if (Array.isArray(pascalValue)) return pascalValue as T[]
            if (Array.isArray(camelValue)) return camelValue as T[]
            return []
        }
        
        // Mapear la respuesta del backend al formato esperado
        const mappedData = {
            id: getStringValue('Id', 'id'),
            usuarioId: getStringValue('UsuarioId', 'usuarioId'),
            usuarioNombre: getStringValue('UsuarioNombre', 'usuarioNombre'),
            usuarioEmail: getStringValue('UsuarioEmail', 'usuarioEmail'),
            nombreRestaurante: getStringValue('NombreRestaurante', 'nombreRestaurante'),
            direccion: getStringValue('Direccion', 'direccion'),
            latitud: getNumberValue('Latitud', 'latitud'),
            longitud: getNumberValue('Longitud', 'longitud'),
            primaryType: getStringValue('PrimaryType', 'primaryType'),
            types: getArrayValue<string>('Types', 'types'),
            horariosJson: (data.HorariosJson ?? dataAny.horariosJson) as string | null,
            gustos: getArrayValue<{ Id?: string; id?: string; Nombre?: string; nombre?: string }>('Gustos', 'gustos').map((g) => ({
                id: String((g as { Id?: string; id?: string }).Id || (g as { id?: string }).id || ''),
                nombre: String((g as { Nombre?: string; nombre?: string }).Nombre || (g as { nombre?: string }).nombre || ''),
            })),
            restricciones: getArrayValue<{ Id?: string; id?: string; Nombre?: string; nombre?: string }>('Restricciones', 'restricciones').map((r) => ({
                id: String((r as { Id?: string; id?: string }).Id || (r as { id?: string }).id || ''),
                nombre: String((r as { Nombre?: string; nombre?: string }).Nombre || (r as { nombre?: string }).nombre || ''),
            })),
            imagenesDestacadas: getStringValue('ImagenesDestacadas', 'imagenesDestacadas'),
            imagenesInterior: getArrayValue<string>('ImagenesInterior', 'imagenesInterior'),
            imagenesComida: getArrayValue<string>('ImagenesComida', 'imagenesComida'),
            imagenMenu: (data.ImagenMenu ?? dataAny.imagenMenu) as string | null,
            logo: (data.Logo ?? dataAny.logo) as string | null,
            fechaCreacionUtc: getStringValue('FechaCreacionUtc', 'fechaCreacionUtc'),
            horarios: horariosParsed,
        }

        return NextResponse.json(mappedData, { status: 200 })
    } catch (error) {
        console.error('Error en /api/admin/detalle/[id]:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

