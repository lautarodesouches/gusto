'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUserRole } from '@/hooks/useUserRole'
import PendienteRestauranteBlocked from '@/components/BlockedView/PendienteRestaurante'
import { ROUTES } from '@/routes'

// Rutas permitidas para dueños de restaurante
const DUENO_RESTAURANTE_ALLOWED_ROUTES = [
    '/restaurante/', // Detalles de su restaurante (necesitará verificar que sea el suyo)
    '/perfil/', // Su perfil
    '/api/restaurantes/mio',
    '/api/restaurantes/dashboard',
    '/auth/', // Rutas de autenticación
    '/', // Home
]

// Rutas públicas que siempre están permitidas
const PUBLIC_ROUTES = [
    '/auth/login',
    '/auth/register',
    '/auth/restaurant',
    '/',
]

/**
 * Componente que protege las rutas según el rol del usuario
 */
export default function RoleProtection({ children }: { children: React.ReactNode }) {
    const { rol, isLoading, isPendienteRestaurante, isDuenoRestaurante } = useUserRole()
    const router = useRouter()
    const pathname = usePathname()
    const [isChecking, setIsChecking] = useState(true)
    const [shouldBlock, setShouldBlock] = useState(false)

    useEffect(() => {
        if (isLoading) {
            setShouldBlock(false)
            return
        }

        // Verificar si es una ruta pública (siempre permitida)
        const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname?.startsWith(route))
        
        if (isPublicRoute) {
            setShouldBlock(false)
            setIsChecking(false)
            return
        }

        // Si es PendienteRestaurante, bloquear todo excepto la vista de bloqueo
        if (isPendienteRestaurante) {
            setShouldBlock(true)
            setIsChecking(false)
            return
        }

        // Si es DuenoRestaurante, verificar que esté en una ruta permitida
        if (isDuenoRestaurante) {
            const isAllowed = DUENO_RESTAURANTE_ALLOWED_ROUTES.some(route => 
                pathname?.startsWith(route)
            )
            
            if (!isAllowed) {
                // Redirigir a su perfil
                router.replace(ROUTES.PROFILE)
                setShouldBlock(false)
                setIsChecking(false)
                return
            }
        }

        setShouldBlock(false)
        setIsChecking(false)
    }, [isLoading, isPendienteRestaurante, isDuenoRestaurante, pathname, router])

    // No renderizar nada hasta que se verifique el rol
    if (isLoading || isChecking) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'var(--background)',
                color: 'white'
            }}>
                Cargando...
            </div>
        )
    }

    // Si es PendienteRestaurante, mostrar la vista bloqueada (bloquear antes de renderizar children)
    if (shouldBlock || isPendienteRestaurante) {
        return <PendienteRestauranteBlocked />
    }

    // Si es DuenñRestaurante, verificar que esté en una ruta permitida
    if (isDuenoRestaurante) {
        const isAllowed = DUENO_RESTAURANTE_ALLOWED_ROUTES.some(route => 
            pathname?.startsWith(route)
        )
        
        if (!isAllowed) {
            // Mostrar loading mientras redirige
            return (
                <div style={{ 
                    minHeight: '100vh', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'var(--background)',
                    color: 'white'
                }}>
                    Redirigiendo...
                </div>
            )
        }
    }

    // Todo está bien, renderizar children
    return <>{children}</>
}

