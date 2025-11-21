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
        
        // Debug: Log de la respuesta del backend
        console.log('Respuesta del backend (raw):', JSON.stringify(data, null, 2))
        console.log('ImagenesDestacadas:', data.ImagenesDestacadas || data.imagenesDestacadas)
        console.log('ImagenesInterior:', data.ImagenesInterior || data.imagenesInterior)
        console.log('ImagenesComida:', data.ImagenesComida || data.imagenesComida)
        console.log('ImagenMenu:', data.ImagenMenu || data.imagenMenu)
        console.log('Logo:', data.Logo || data.logo)
        console.log('HorariosJson:', data.HorariosJson || data.horariosJson)
        console.log('Horarios:', data.Horarios || data.horarios)
        
        // Parsear horarios desde HorariosJson si Horarios está vacío o inválido
        let horariosParsed: Array<{
            dia: string
            cerrado: boolean
            desde?: string | null
            hasta?: string | null
        }> = []

        // Verificar si Horarios tiene datos válidos (no vacíos y con dia no vacío)
        const horariosValidos = (data.Horarios || data.horarios || []).filter((h: {
            Dia?: string
            dia?: string
        }) => {
            const dia = h.Dia || h.dia || ''
            return dia.trim() !== ''
        })

        // Si hay horarios válidos, usarlos
        if (horariosValidos.length > 0) {
            horariosParsed = horariosValidos.map((h: {
                Dia?: string
                dia?: string
                Cerrado?: boolean
                cerrado?: boolean
                Desde?: string | null
                desde?: string | null
                Hasta?: string | null
                hasta?: string | null
            }) => ({
                dia: h.Dia || h.dia || '',
                cerrado: h.Cerrado ?? h.cerrado ?? false,
                desde: h.Desde ?? h.desde ?? null,
                hasta: h.Hasta ?? h.hasta ?? null,
            }))
        } else {
            // Si no hay Horarios válidos, intentar parsear desde HorariosJson
            const horariosJson = data.HorariosJson || data.horariosJson
            if (horariosJson && typeof horariosJson === 'string' && horariosJson.trim() !== '') {
                try {
                    const parsed = JSON.parse(horariosJson)
                    if (Array.isArray(parsed)) {
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
                            dia: h.Dia || h.dia || '',
                            cerrado: h.Cerrado ?? h.cerrado ?? false,
                            desde: h.Desde ?? h.desde ?? null,
                            hasta: h.Hasta ?? h.hasta ?? null,
                        }))
                    }
                } catch (error) {
                    console.error('Error al parsear horariosJson:', error)
                    console.error('horariosJson recibido:', horariosJson)
                }
            }
        }
        
        console.log('Horarios parseados:', horariosParsed)
        
        // Mapear la respuesta del backend al formato esperado
        const mappedData = {
            id: data.Id || data.id || '',
            usuarioId: data.UsuarioId || data.usuarioId || '',
            usuarioNombre: data.UsuarioNombre || data.usuarioNombre || '',
            usuarioEmail: data.UsuarioEmail || data.usuarioEmail || '',
            nombreRestaurante: data.NombreRestaurante || data.nombreRestaurante || '',
            direccion: data.Direccion || data.direccion || '',
            latitud: data.Latitud ?? data.latitud ?? null,
            longitud: data.Longitud ?? data.longitud ?? null,
            primaryType: data.PrimaryType || data.primaryType || '',
            types: data.Types || data.types || [],
            horariosJson: data.HorariosJson ?? data.horariosJson ?? null,
            gustos: (data.Gustos || data.gustos || []).map((g) => ({
                id: String(g.Id || g.id || ''),
                nombre: g.Nombre || g.nombre || '',
            })),
            restricciones: (data.Restricciones || data.restricciones || []).map((r) => ({
                id: String(r.Id || r.id || ''),
                nombre: r.Nombre || r.nombre || '',
            })),
            imagenesDestacadas: data.ImagenesDestacadas || data.imagenesDestacadas || '',
            imagenesInterior: Array.isArray(data.ImagenesInterior) ? data.ImagenesInterior : 
                            Array.isArray(data.imagenesInterior) ? data.imagenesInterior : [],
            imagenesComida: Array.isArray(data.ImagenesComida) ? data.ImagenesComida : 
                           Array.isArray(data.imagenesComida) ? data.imagenesComida : [],
            imagenMenu: data.ImagenMenu ?? data.imagenMenu ?? null,
            logo: data.Logo ?? data.logo ?? null,
            fechaCreacionUtc: data.FechaCreacionUtc || data.fechaCreacionUtc || '',
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

