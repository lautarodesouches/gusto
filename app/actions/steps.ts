'use server'
import { cookies } from 'next/headers'
import { API_URL } from '@/constants'
import { ApiResponse, RegisterItem } from '@/types'

const ERROR_MESSAGES = {
    MISSING_TOKEN: 'Token no encontrado en cookies',
    INVALID_DATA: 'Datos inválidos',
    BACKEND_CONNECTION: 'No se pudo conectar con el backend',
    RESTRICCIONES_ERROR: 'Error al guardar restricciones',
    CONDICIONES_ERROR: 'Error al guardar condiciones médicas',
    GUSTOS_ERROR: 'Error al guardar gustos',
    FINALIZAR_ERROR: 'Error al finalizar registro',
    FETCH_ERROR: 'Error al obtener datos del backend',
    INTERNAL_ERROR: 'Error interno del servidor',
} as const

interface StepsData {
    step1?: Array<{ id: string | number }>
    step2?: Array<{ id: string | number }>
    step3?: Array<{ id: string | number }>
}

interface BackendItem {
    id: number | string
    nombre: string
    seleccionado?: boolean
    imagenUrl?: string
}

/**
 * Obtiene el token de las cookies
 */
async function getToken(): Promise<string | null> {
    const cookieStore = await cookies()
    return cookieStore.get('token')?.value || null
}

/**
 * Mapea un item del backend a RegisterItem
 */
function mapToRegisterItem(item: BackendItem): RegisterItem {
    return {
        id: String(item.id),
        nombre: item.nombre,
        seleccionado: item.seleccionado || false,
        imagenUrl: item.imagenUrl,
    }
}

/**
 * Maneja errores de fetch y retorna un ApiResponse con error
 */
function handleFetchError(
    error: unknown,
    context: string
): ApiResponse<never> {
    const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
    console.error(`Error inesperado ${context}:`, {
        error: errorMessage,
        timestamp: new Date().toISOString(),
    })
    return {
        success: false,
        error: ERROR_MESSAGES.BACKEND_CONNECTION,
    }
}

/**
 * Obtiene datos del backend y los mapea a RegisterItem[]
 */
async function fetchStepData(
    endpoint: string,
    context: string,
    extractData?: (response: unknown) => BackendItem[]
): Promise<ApiResponse<RegisterItem[]>> {
    try {
        const token = await getToken()

        if (!token) {
            return {
                success: false,
                error: ERROR_MESSAGES.MISSING_TOKEN,
            }
        }

        const res = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        })

        if (!res.ok) {
            const errorText = await res.text().catch(() => '')
            console.error(`Error obteniendo ${context}:`, res.status, errorText)
            return {
                success: false,
                error: ERROR_MESSAGES.FETCH_ERROR,
            }
        }

        const response = await res.json()
        const items = extractData ? extractData(response) : response
        const data: RegisterItem[] = items.map(mapToRegisterItem)

        return {
            success: true,
            data,
        }
    } catch (error) {
        return handleFetchError(error, `obteniendo ${context}`)
    }
}

/**
 * Guarda items en un endpoint específico del backend
 */
async function saveStepItems(
    endpoint: string,
    token: string,
    items: Array<{ id: string | number }>
): Promise<Response> {
    return fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            ids: items.map((item) => String(item.id)),
            skip: items.length === 0,
        }),
    })
}

/**
 * Guarda un paso y maneja errores
 */
async function saveStep(
    endpoint: string,
    token: string,
    items: Array<{ id: string | number }>,
    errorMessage: string
): Promise<ApiResponse<never> | null> {
    try {
        const res = await saveStepItems(endpoint, token, items)
        if (!res.ok) {
            const errorText = await res.text()
            console.error(`Error en ${errorMessage}:`, res.status, errorText)
            return {
                success: false,
                error: errorMessage,
            }
        }
        return null // Éxito
    } catch (error) {
        return handleFetchError(error, `guardando ${errorMessage}`)
    }
}

/**
 * Finaliza el registro del usuario en el backend (interno)
 */
async function finalizarRegistroInternal(token: string): Promise<Response> {
    return fetch(`${API_URL}/Usuario/finalizar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    })
}

/**
 * Finaliza el registro del usuario (Server Action)
 */
export async function finishRegistration(): Promise<ApiResponse<{ success: boolean }>> {
    try {
        const token = await getToken()
        if (!token) {
            return { success: false, error: ERROR_MESSAGES.MISSING_TOKEN }
        }

        const res = await finalizarRegistroInternal(token)

        if (!res.ok) {
            const errorText = await res.text()
            console.error('Error al finalizar registro:', res.status, errorText)
            return { success: false, error: errorText || ERROR_MESSAGES.FINALIZAR_ERROR }
        }

        return { success: true, data: { success: true } }
    } catch (error) {
        return handleFetchError(error, 'finalizando registro')
    }
}

/**
 * Guarda todos los pasos del registro (restricciones, condiciones, gustos) y finaliza el registro
 * @param stepsData - Datos de los tres pasos del registro
 * @returns ApiResponse indicando éxito o error
 */
export async function saveSteps(
    stepsData: StepsData
): Promise<ApiResponse<{ success: boolean }>> {
    try {
        // Validar y normalizar los datos
        const safeStep1 = Array.isArray(stepsData.step1) ? stepsData.step1 : []
        const safeStep2 = Array.isArray(stepsData.step2) ? stepsData.step2 : []
        const safeStep3 = Array.isArray(stepsData.step3) ? stepsData.step3 : []

        // Obtener token de las cookies
        const token = await getToken()

        if (!token) {
            console.error('Token no encontrado en cookies')
            return {
                success: false,
                error: ERROR_MESSAGES.MISSING_TOKEN,
            }
        }

        // Guardar cada paso
        const steps = [
            {
                endpoint: '/Usuario/restricciones',
                items: safeStep1,
                errorMessage: ERROR_MESSAGES.RESTRICCIONES_ERROR,
            },
            {
                endpoint: '/Usuario/condiciones',
                items: safeStep2,
                errorMessage: ERROR_MESSAGES.CONDICIONES_ERROR,
            },
            {
                endpoint: '/Usuario/gustos',
                items: safeStep3,
                errorMessage: ERROR_MESSAGES.GUSTOS_ERROR,
            },
        ]

        for (const step of steps) {
            const error = await saveStep(
                step.endpoint,
                token,
                step.items,
                step.errorMessage
            )
            if (error) {
                return error
            }
        }

        // Finalizar registro (no crítico si falla)
        try {
            const resFinalizar = await finalizarRegistroInternal(token)
            if (!resFinalizar.ok) {
                const errorText = await resFinalizar.text()
                console.error('Error al finalizar registro:', resFinalizar.status, errorText)
            }
        } catch (error) {
            // No retornamos error aquí porque los pasos ya se guardaron exitosamente
            console.error('Error de conexión al finalizar registro:', error)
        }

        return {
            success: true,
            data: { success: true },
        }
    } catch (error) {
        return handleFetchError(error, 'en saveSteps')
    }
}

/**
 * Obtiene las restricciones (alergias e intolerancias) disponibles
 * @returns ApiResponse con la lista de restricciones
 */
export async function getRestricciones(): Promise<
    ApiResponse<RegisterItem[]>
> {
    return fetchStepData('/Restriccion', 'restricciones')
}

/**
 * Obtiene las condiciones médicas disponibles
 * @returns ApiResponse con la lista de condiciones médicas
 */
export async function getCondicionesMedicas(): Promise<
    ApiResponse<RegisterItem[]>
> {
    return fetchStepData('/CondicionMedica', 'condiciones médicas')
}

/**
 * Obtiene los gustos (preferencias de comida) disponibles
 * @returns ApiResponse con la lista de gustos
 */
export async function getGustos(): Promise<ApiResponse<RegisterItem[]>> {
    return fetchStepData('/Gusto', 'gustos', (response) => {
        // El backend devuelve gustos dentro de un objeto con propiedad 'gustos'
        return (response as { gustos?: BackendItem[] }).gustos || []
    })
}

/**
 * Guarda restricciones (POST - registro inicial)
 */
export async function saveRestricciones(ids: (string | number)[], skip: boolean = false): Promise<ApiResponse<never>> {
    try {
        const token = await getToken()
        if (!token) {
            return { success: false, error: ERROR_MESSAGES.MISSING_TOKEN }
        }

        const safeIds = Array.isArray(ids) ? ids.map(id => String(id)) : []

        const res = await fetch(`${API_URL}/Usuario/restricciones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ids: safeIds, skip }),
        })

        if (!res.ok) {
            const errorText = await res.text()
            return { success: false, error: errorText || ERROR_MESSAGES.RESTRICCIONES_ERROR }
        }

        return { success: true }
    } catch (error) {
        return handleFetchError(error, 'guardando restricciones')
    }
}

/**
 * Actualiza restricciones (PUT - edición)
 */
export async function updateRestricciones(ids: (string | number)[], skip: boolean = false): Promise<ApiResponse<never>> {
    try {
        const token = await getToken()
        if (!token) {
            return { success: false, error: ERROR_MESSAGES.MISSING_TOKEN }
        }

        const safeIds = Array.isArray(ids) ? ids.map(id => String(id)) : []

        const res = await fetch(`${API_URL}/Restriccion/restricciones`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ids: safeIds, skip }),
        })

        if (!res.ok) {
            const errorText = await res.text()
            return { success: false, error: errorText || ERROR_MESSAGES.RESTRICCIONES_ERROR }
        }

        return { success: true }
    } catch (error) {
        return handleFetchError(error, 'actualizando restricciones')
    }
}

/**
 * Guarda condiciones médicas (POST - registro inicial)
 */
export async function saveCondiciones(ids: (string | number)[], skip: boolean = false): Promise<ApiResponse<never>> {
    try {
        const token = await getToken()
        if (!token) {
            return { success: false, error: ERROR_MESSAGES.MISSING_TOKEN }
        }

        const safeIds = Array.isArray(ids) ? ids.map(id => String(id)) : []

        const res = await fetch(`${API_URL}/Usuario/condiciones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ids: safeIds, skip }),
        })

        if (!res.ok) {
            const errorText = await res.text()
            return { success: false, error: errorText || ERROR_MESSAGES.CONDICIONES_ERROR }
        }

        return { success: true }
    } catch (error) {
        return handleFetchError(error, 'guardando condiciones')
    }
}

/**
 * Actualiza condiciones médicas (PUT - edición)
 */
export async function updateCondiciones(ids: (string | number)[], skip: boolean = false): Promise<ApiResponse<never>> {
    try {
        const token = await getToken()
        if (!token) {
            return { success: false, error: ERROR_MESSAGES.MISSING_TOKEN }
        }

        const safeIds = Array.isArray(ids) ? ids.map(id => String(id)) : []

        const res = await fetch(`${API_URL}/CondicionMedica/condiciones`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ids: safeIds, skip }),
        })

        if (!res.ok) {
            const errorText = await res.text()
            return { success: false, error: errorText || ERROR_MESSAGES.CONDICIONES_ERROR }
        }

        return { success: true }
    } catch (error) {
        return handleFetchError(error, 'actualizando condiciones')
    }
}

/**
 * Guarda gustos (POST - registro inicial)
 */
export async function saveGustos(ids: (string | number)[], skip: boolean = false): Promise<ApiResponse<never>> {
    try {
        const token = await getToken()
        if (!token) {
            return { success: false, error: ERROR_MESSAGES.MISSING_TOKEN }
        }

        const safeIds = Array.isArray(ids) ? ids.map(id => String(id)) : []

        const res = await fetch(`${API_URL}/Usuario/gustos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ids: safeIds, skip }),
        })

        if (!res.ok) {
            const errorText = await res.text()
            return { success: false, error: errorText || ERROR_MESSAGES.GUSTOS_ERROR }
        }

        return { success: true }
    } catch (error) {
        return handleFetchError(error, 'guardando gustos')
    }
}

/**
 * Actualiza gustos (PUT - edición)
 */
export async function updateGustos(ids: (string | number)[], skip: boolean = false): Promise<ApiResponse<never>> {
    try {
        const token = await getToken()
        if (!token) {
            return { success: false, error: ERROR_MESSAGES.MISSING_TOKEN }
        }

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

        const res = await fetch(`${API_URL}/Gusto/gustos`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ids: safeIds, skip }),
        })

        if (!res.ok) {
            const errorText = await res.text()
            return { success: false, error: errorText || ERROR_MESSAGES.GUSTOS_ERROR }
        }

        return { success: true }
    } catch (error) {
        return handleFetchError(error, 'actualizando gustos')
    }
}

/**
 * Obtiene el resumen del usuario (restricciones, condiciones médicas y gustos)
 * @param mode - Modo de operación ('edicion' o 'registro')
 * @returns ApiResponse con el resumen del usuario
 */
export async function getUserResumen(mode?: string): Promise<ApiResponse<{
    restricciones?: Array<{ id: string | number; nombre: string }>
    condicionesMedicas?: Array<{ id: string | number; nombre: string }>
    gustos?: Array<{ id: string | number; nombre: string }>
}>> {
    try {
        const token = await getToken()
        if (!token) {
            return { success: false, error: ERROR_MESSAGES.MISSING_TOKEN }
        }

        const endpoint = mode === 'edicion' ? '/PerfilUsuario/resumen' : '/Usuario/resumen'

        const res = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        })

        if (!res.ok) {
            const errorText = await res.text().catch(() => '')
            console.error('Error obteniendo resumen:', res.status, errorText)
            return {
                success: false,
                error: ERROR_MESSAGES.FETCH_ERROR,
            }
        }

        const data = await res.json()
        return {
            success: true,
            data,
        }
    } catch (error) {
        return handleFetchError(error, 'obteniendo resumen de usuario')
    }
}
