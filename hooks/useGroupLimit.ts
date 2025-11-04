'use client'

import { useState } from 'react'

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
            const res = await fetch('/api/group', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nombre, descripcion }),
            })

            const data = await res.json()

            if (!res.ok) {
                if (data.error === 'LIMITE_GRUPOS_ALCANZADO') {
                    return { 
                        success: false, 
                        needsUpgrade: true,
                        error: data.message 
                    }
                }
                return { 
                    success: false, 
                    error: data.message || 'Error creando grupo' 
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