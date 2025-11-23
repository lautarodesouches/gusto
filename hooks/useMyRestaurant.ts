'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

interface MyRestaurantResult {
    restaurantId: string | null
    isLoading: boolean
    error: string | null
}

/**
 * Hook para obtener el ID del restaurante del dueño actual
 */
export function useMyRestaurant(): MyRestaurantResult {
    const { token, loading: authLoading } = useAuth()
    const [restaurantId, setRestaurantId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Si aún está cargando la autenticación, esperar
        if (authLoading) {
            setIsLoading(true)
            return
        }

        // Si no hay token, no hay restaurante
        if (!token) {
            setRestaurantId(null)
            setIsLoading(false)
            return
        }

        const fetchMyRestaurant = async () => {
            try {
                setIsLoading(true)
                setError(null)
                
                const response = await fetch('/api/restaurantes/mio', {
                    cache: 'no-store',
                    credentials: 'include',
                })
                
                if (response.ok) {
                    const data = await response.json()
                    // El backend devuelve directamente el ID (GUID como string)
                    // Puede venir como string directo o como objeto con id/Id
                    let id: string | null = null
                    
                    if (typeof data === 'string') {
                        // Si es un string directo (el ID)
                        id = data
                    } else if (data && typeof data === 'object') {
                        // Si es un objeto, buscar id o Id
                        id = data.id || data.Id || null
                    }
                    
                    setRestaurantId(id ? String(id) : null)
                } else {
                    setError('No se pudo obtener el restaurante')
                    setRestaurantId(null)
                }
            } catch (err) {
                console.error('Error obteniendo restaurante:', err)
                setError('Error al obtener restaurante')
                setRestaurantId(null)
            } finally {
                setIsLoading(false)
            }
        }

        fetchMyRestaurant()
    }, [token, authLoading])

    return {
        restaurantId,
        isLoading,
        error,
    }
}

