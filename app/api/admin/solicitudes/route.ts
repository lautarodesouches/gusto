import { NextRequest, NextResponse } from 'next/server'
import { API_URL } from '@/constants'
import { cookies } from 'next/headers'
import type { SolicitudRestauranteBackend, SolicitudStatus } from '@/types'

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No autorizado: falta token' },
                { status: 401 }
            )
        }

        // Obtener el parámetro tipo de la query string
        // El backend usa: Pendiente=0, Aprobada=1, Rechazada=2, Todas=3
        const { searchParams } = new URL(req.url)
        const tipoParam = searchParams.get('tipo') || 'Pendiente'
        
        // Mapear los valores del frontend a los del backend
        const tipoMap: Record<string, string> = {
            'Pendiente': 'Pendiente',
            'Aceptado': 'Aprobada',  // Frontend usa 'Aceptado', backend usa 'Aprobada'
            'Rechazado': 'Rechazada', // Frontend usa 'Rechazado', backend usa 'Rechazada'
            'Todos': 'Todas',         // Frontend usa 'Todos', backend usa 'Todas'
        }
        const tipo = tipoMap[tipoParam] || tipoParam

        const response = await fetch(`${API_URL}/Admin/solicitudes?tipo=${tipo}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        })

        if (!response.ok) {
            const errorText = await response.text().catch(() => '')
            let errorMessage = 'Error al obtener solicitudes'
            
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
        
        // Mapear el estado del backend al frontend
        // Backend: Pendiente=0, Aprobada=1, Rechazada=2, Todas=3
        // Frontend: 'Pendiente', 'Aceptado', 'Rechazado'
        const mapEstadoToStatus = (estado: number | string | undefined): SolicitudStatus => {
            if (estado === undefined || estado === null) return 'Pendiente'
            
            // Si viene como string, intentar parsearlo
            let estadoNum: number
            if (typeof estado === 'string') {
                // Si es un string numérico, parsearlo
                const parsed = parseInt(estado, 10)
                if (!isNaN(parsed)) {
                    estadoNum = parsed
                } else {
                    // Si es un string con el nombre del enum, mapearlo
                    const estadoLower = estado.toLowerCase().trim()
                    if (estadoLower === 'pendiente' || estadoLower === '0' || estadoLower === 'pendiente') estadoNum = 0
                    else if (estadoLower === 'aprobada' || estadoLower === '1' || estadoLower === 'aprobado' || estadoLower === 'aceptado' || estadoLower === 'aceptada') estadoNum = 1
                    else if (estadoLower === 'rechazada' || estadoLower === '2' || estadoLower === 'rechazado') estadoNum = 2
                    else return 'Pendiente'
                }
            } else {
                estadoNum = estado
            }
            
            switch (estadoNum) {
                case 0: // Pendiente
                    return 'Pendiente'
                case 1: // Aprobada
                    return 'Aceptado'
                case 2: // Rechazada
                    return 'Rechazado'
                default:
                    return 'Pendiente'
            }
        }
        
        // Mapear la respuesta del backend al formato esperado
        const mappedData = Array.isArray(data) ? data.map((item: SolicitudRestauranteBackend) => {
            // El backend puede devolver los datos en PascalCase o camelCase dependiendo de la configuración
            // Intentar leer ambos casos para mayor compatibilidad
            const itemAny = item as unknown as Record<string, unknown>
            
            // Función helper para obtener un string de un campo (PascalCase o camelCase)
            const getStringValue = (pascalKey: string, camelKey: string): string => {
                const pascalValue = itemAny[pascalKey]
                const camelValue = itemAny[camelKey]
                
                if (typeof pascalValue === 'string' && pascalValue) return pascalValue
                if (typeof camelValue === 'string' && camelValue) return camelValue
                return ''
            }
            
            // Función helper para convertir unknown a number | string | undefined
            const getEstadoValue = (value: unknown): number | string | undefined => {
                if (value === null || value === undefined) return undefined
                if (typeof value === 'number' || typeof value === 'string') return value
                return undefined
            }
            
            // Leer campos en ambos formatos (PascalCase y camelCase)
            const id = getStringValue('Id', 'id')
            const nombreRestaurante = getStringValue('NombreRestaurante', 'nombreRestaurante')
            const direccion = getStringValue('Direccion', 'direccion')
            const usuarioNombre = getStringValue('UsuarioNombre', 'usuarioNombre')
            const usuarioEmail = getStringValue('UsuarioEmail', 'usuarioEmail')
            const imgLogo = getStringValue('imgLogo', 'imgLogo')
            const fechaCreacionUtc = getStringValue('FechaCreacionUtc', 'fechaCreacionUtc')
            
            // Leer Estado
            const estadoBackend = item.Estado 
                ?? item.EstadoSolicitudRestaurante 
                ?? getEstadoValue(itemAny.estado)
                ?? getEstadoValue(itemAny.estadoSolicitudRestaurante)
            
            const status = mapEstadoToStatus(estadoBackend)
            
            return {
                id,
                nombreRestaurante,
                direccion,
                usuarioNombre,
                usuarioEmail,
                imgLogo,
                fechaCreacionUtc,
                status,
            }
        }) : []

        return NextResponse.json(mappedData, { status: 200 })
    } catch (error) {
        console.error('Error en /api/admin/solicitudes:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

