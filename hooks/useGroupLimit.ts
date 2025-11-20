'use client'

import { useState } from 'react'
import { createGroup as createGroupAction } from '@/app/actions/groups'

interface UseGroupLimitResult {
    createGroup: (nombre: string, descripcion: string) => Promise<{
        success: boolean
        needsUpgrade?: boolean
        error?: string
    }>
    loading: boolean
}

export function useGroupLimit(): UseGroupLimitResult {
    const [loading, setLoading] = useState(false)

    const createGroup = async (nombre: string, descripcion: string) => {
        if (!nombre || !descripcion) {
            return { success: false, error: 'Nombre y descripción son requeridos' }
        }

        setLoading(true)
        try {
            const result = await createGroupAction({ name: nombre, description: descripcion })

            if (!result.success) {
                // Verificar si es error de límite de grupos
                const errorLower = result.error?.toLowerCase() || ''
                if (errorLower.includes('límite') || errorLower.includes('limite') || errorLower.includes('premium')) {
                    return { 
                        success: false, 
                        needsUpgrade: true,
                        error: result.error 
                    }
                }
                return { 
                    success: false, 
                    error: result.error || 'Error creando grupo' 
                }
            }

            return { success: true }
        } catch (err) {
            console.error(err)
            return { 
                success: false, 
                error: 'Error de conexión. Intenta nuevamente.' 
            }
        } finally {
            setLoading(false)
        }
    }

    return {
        createGroup,
        loading
    }
}