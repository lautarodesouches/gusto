import { NextRequest, NextResponse } from 'next/server'
import { API_URL } from '@/constants'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No autorizado: falta token' },
                { status: 401 }
            )
        }

        // Obtener FormData del request
        const formData = await req.formData()

        // Crear nuevo FormData para enviar al backend
        const backendFormData = new FormData()

        // Campos de texto simples
        const nombre = formData.get('nombre') as string
        const direccion = formData.get('direccion') as string
        const lat = formData.get('lat')
        const lng = formData.get('lng')
        const primaryType = formData.get('primaryType') as string
        const horariosJson = formData.get('horarios') as string
        const websiteUrl = formData.get('WebsiteUrl') as string

        if (nombre) backendFormData.append('Nombre', nombre)
        if (direccion) backendFormData.append('Direccion', direccion)
        if (lat) backendFormData.append('lat', lat.toString())
        if (lng) backendFormData.append('lng', lng.toString())
        if (primaryType) backendFormData.append('primaryType', primaryType)
        if (websiteUrl) backendFormData.append('WebsiteUrl', websiteUrl)
        // El handler recibe horariosJson como string directamente
        // El DTO debería tener: public string? HorariosJson { get; set; }
        // O con [FromForm(Name = "horariosJson")] si el nombre es diferente
        if (horariosJson) {
            console.log('Enviando horarios al backend como horariosJson (string):', horariosJson)
            backendFormData.append('horariosJson', horariosJson)
        } else {
            console.warn('No se encontró horarios en el FormData')
        }

        // Tipos (array de strings)
        const types = formData.getAll('types')
        if (types.length > 0) {
            types.forEach(type => {
                backendFormData.append('types', type as string)
            })
        }

        // Gustos que sirve (array de GUIDs)
        const gustosQueSirveIds = formData.getAll('gustosQueSirveIds')
        if (gustosQueSirveIds.length > 0) {
            gustosQueSirveIds.forEach(id => {
                backendFormData.append('gustosQueSirveIds', id as string)
            })
        }

        // Restricciones que respeta (array de GUIDs)
        const restriccionesQueRespetaIds = formData.getAll('restriccionesQueRespetaIds')
        if (restriccionesQueRespetaIds.length > 0) {
            restriccionesQueRespetaIds.forEach(id => {
                backendFormData.append('restriccionesQueRespetaIds', id as string)
            })
        }

        // Archivos
        const imagenDestacada = formData.get('imagenDestacada') as File | null
        if (imagenDestacada && imagenDestacada.size > 0) {
            backendFormData.append('ImagenDestacada', imagenDestacada)
        }

        const imagenesInterior = formData.getAll('imagenesInterior') as File[]
        imagenesInterior.forEach(file => {
            if (file && file.size > 0) {
                backendFormData.append('ImagenesInterior', file)
            }
        })

        const imagenesComidas = formData.getAll('imagenesComidas') as File[]
        imagenesComidas.forEach(file => {
            if (file && file.size > 0) {
                backendFormData.append('ImagenesComidas', file)
            }
        })

        const imagenMenu = formData.get('imagenMenu') as File | null
        if (imagenMenu && imagenMenu.size > 0) {
            backendFormData.append('ImagenMenu', imagenMenu)
        }

        const logo = formData.get('logo') as File | null
        if (logo && logo.size > 0) {
            backendFormData.append('Logo', logo)
        }

        // Enviar al backend
        const response = await fetch(`${API_URL}/api/Restaurantes`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                // NO incluir Content-Type, el navegador lo establecerá automáticamente con el boundary
            },
            body: backendFormData,
        })

        if (!response.ok) {
            const errorText = await response.text().catch(() => '')
            let errorMessage = ''
            let errorData: { errors?: Record<string, string[]>; message?: string; error?: string; title?: string } = {}
            
            try {
                errorData = errorText ? JSON.parse(errorText) : {}
                
                // Si hay errores de validación, solo devolverlos sin mensaje general
                if (errorData.errors) {
                    return NextResponse.json(
                        { errors: errorData.errors },
                        { status: response.status }
                    )
                }
                
                // Si no hay errores de validación, devolver mensaje general
                errorMessage = errorData.message || errorData.error || errorData.title || 'Error al crear la solicitud de restaurante'
            } catch {
                if (errorText) {
                    errorMessage = errorText
                } else {
                    errorMessage = 'Error al crear la solicitud de restaurante'
                }
            }

            return NextResponse.json(
                { error: errorMessage },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data, { status: 200 })
    } catch (error) {
        console.error('Error en /api/restaurante/agregar:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

