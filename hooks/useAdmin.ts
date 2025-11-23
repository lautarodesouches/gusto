'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/routes'

/**
 * Hook para verificar si el usuario actual es admin
 * Úsalo en componentes cliente para proteger rutas o mostrar/ocultar elementos
 */
export function useAdmin() {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null) // null = loading
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const response = await fetch('/api/admin/check')
                
                if (response.ok) {
                    const data = await response.json()
                    setIsAdmin(data.isAdmin === true)
                } else {
                    setIsAdmin(false)
                }
            } catch (error) {
                console.error('Error verificando admin:', error)
                setIsAdmin(false)
            } finally {
                setIsLoading(false)
            }
        }

        checkAdmin()
    }, [])

    /**
     * Redirige a HOME si el usuario no es admin
     */
    const requireAdmin = () => {
        if (!isLoading && !isAdmin) {
            router.push(ROUTES.HOME)
        }
    }

    return {
        isAdmin,
        isLoading,
        requireAdmin,
    }
}

