'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useUserRole } from '@/hooks/useUserRole'
import { useMyRestaurant } from '@/hooks/useMyRestaurant'
import { useAuth } from '@/context/AuthContext'
import { logout as logoutAction } from '@/app/actions/login'
import PendienteRestauranteBlocked from '@/components/BlockedView/PendienteRestaurante'
import { ROUTES } from '@/routes'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'

// Rutas permitidas para dueños de restaurante - SOLO su dashboard
const _DUENO_RESTAURANTE_ALLOWED_ROUTES = [
    '/restaurante/', // Solo para acceder a su dashboard específico
    '/api/restaurantes/dashboard',
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
    const { isLoading, isPendienteRestaurante, isDuenoRestaurante, isAdmin } = useUserRole()
    const { restaurantId, isLoading: isLoadingRestaurant } = useMyRestaurant()
    const { logout } = useAuth()
    const pathname = usePathname()
    const [isChecking, setIsChecking] = useState(true)
    const [shouldBlock, setShouldBlock] = useState(false)
    const [hasRedirected, setHasRedirected] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    // Verificar si es una ruta pública (solo para usuarios normales)
    // HACER ESTO PRIMERO para evitar parpadeos o recargas en registro/login
    // OJO: para '/' solo coincidencia exacta, para no marcar todo como público
    const isPublicRoute = PUBLIC_ROUTES.some(route => {
        if (!pathname) return false
        if (route === '/') return pathname === '/'
        return pathname === route || pathname.startsWith(route)
    })

    const handleGoHomeAndLogout = async () => {
        try {
            setIsLoggingOut(true)
            // Eliminar cookie de autenticación (server action)
            await logoutAction()
            // Cerrar sesión en Firebase y limpiar estado
            await logout()
            // Usar window.location.href para forzar navegación completa y limpiar estado
            // Esto evita que componentes intenten cargar datos antes de que el logout termine
            window.location.href = ROUTES.HOME
        } catch (error) {
            console.error('Error al cerrar sesión:', error)
            // Aún así redirigir al home con navegación completa
            window.location.href = ROUTES.HOME
        } finally {
            setIsLoggingOut(false)
        }
    }

    useEffect(() => {
        // Mientras está cargando roles o restaurante, no aplicar lógica (afuera se muestra "Cargando...")
        if (isLoading || isLoadingRestaurant) {
            return
        }

        // ADMIN: auto-redirigir al panel de admin cuando está en una ruta pública (p.ej. después de login)
        // Pero NO bloquear otras rutas - puede navegar libremente por la app
        if (isAdmin) {
            const adminBase = ROUTES.ADMIN // '/admin'
            const isAdminRoute =
                pathname === adminBase ||
                (pathname?.startsWith(adminBase) &&
                    (pathname.length === adminBase.length ||
                        pathname[adminBase.length] === '/'))

            // Si está en ruta pública y no en /admin, redirigir una sola vez al panel
            if (isPublicRoute && !isAdminRoute && !hasRedirected) {
                setHasRedirected(true)
                setIsChecking(false)
                window.location.href = adminBase
                return
            }

            // Si ya está en /admin o subruta, permitir continuar
            if (isAdminRoute) {
                setShouldBlock(false)
                setIsChecking(false)
                setHasRedirected(false)
                return
            }
            
            // Si es admin y está en una ruta NO pública y NO es /admin (por ejemplo /mapa),
            // permitir navegar libremente - NO bloquear
            setShouldBlock(false)
            setIsChecking(false)
            setHasRedirected(false)
            return
        }

        // Rutas públicas para usuarios normales (no dueño ni admin)
        if (isPublicRoute && !isDuenoRestaurante && !isAdmin) {
            setShouldBlock(false)
            setIsChecking(false)
            setHasRedirected(false)
            return
        }

        // Si es PendienteRestaurante, bloquear todo excepto la vista de bloqueo
        if (isPendienteRestaurante) {
            setShouldBlock(true)
            setIsChecking(false)
            return
        }

        // Si es DuenoRestaurante, redirigir automáticamente a su dashboard
        if (isDuenoRestaurante) {
            // Si aún está cargando el restaurante, esperar
            if (isLoadingRestaurant) {
                setIsChecking(true)
                return
            }

            // Si no tiene restaurante después de cargar, mostrar error
            if (!restaurantId) {
                setIsChecking(false)
                return
            }

            // Construir la ruta del dashboard
            const dashboardPath = `${ROUTES.RESTAURANT}${restaurantId}/dashboard`
            const isDashboardRoute = pathname === dashboardPath || pathname?.startsWith(`${ROUTES.RESTAURANT}${restaurantId}/dashboard`)

            // Si no está en el dashboard, redirigir inmediatamente (incluso si está en ruta pública)
            if (!isDashboardRoute && !hasRedirected) {
                setHasRedirected(true)
                setIsChecking(false)
                // Usar window.location para forzar la navegación completa
                window.location.href = dashboardPath
                return
            }

            // Si ya está en el dashboard, permitir continuar
            if (isDashboardRoute) {
                setShouldBlock(false)
                setIsChecking(false)
                return
            }
        }

        setShouldBlock(false)
        setIsChecking(false)
    }, [isLoading, isLoadingRestaurant, isPendienteRestaurante, isDuenoRestaurante, isAdmin, restaurantId, pathname, hasRedirected])

    if (isPublicRoute) {
        return <>{children}</>
    }

    if (isLoading || isChecking || (isDuenoRestaurante && isLoadingRestaurant)) {
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

    // Si es DuenoRestaurante, verificar que esté en su dashboard
    if (isDuenoRestaurante) {
        // Solo mostrar "Restaurante no encontrado" si ya terminó de cargar y no hay restaurante
        // Si isLoadingRestaurant es true, ya se mostró "Cargando..." arriba
        if (!restaurantId && !isLoadingRestaurant) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--background)',
                    padding: '2rem'
                }}>
                    <div style={{
                        maxWidth: '600px',
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '1.5rem',
                        padding: '3rem 2rem',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: 700,
                            color: '#ffffff',
                            margin: '0 0 1rem 0'
                        }}>
                            Restaurante no encontrado
                        </h1>
                        <p style={{
                            fontSize: '1.125rem',
                            color: '#e0e0e0',
                            margin: '0 0 2rem 0',
                            lineHeight: 1.6
                        }}>
                            No se encontró tu restaurante. Contacta al soporte.
                        </p>
                        <button
                            onClick={handleGoHomeAndLogout}
                            disabled={isLoggingOut}
                            style={{
                                margin: '0 auto',
                                padding: '0.875rem 2rem',
                                background: 'linear-gradient(135deg, #ff5757 0%, #ff6b6b 100%)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '0.75rem',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(255, 87, 87, 0.3)',
                                width: 'fit-content',
                                opacity: isLoggingOut ? 0.7 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (!isLoggingOut) {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ff8080 100%)'
                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isLoggingOut) {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #ff5757 0%, #ff6b6b 100%)'
                                    e.currentTarget.style.transform = 'translateY(0)'
                                }
                            }}
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} style={{ fontSize: '1rem' }} />
                            {isLoggingOut ? 'Cerrando sesión...' : 'Volver al inicio y cerrar sesión'}
                        </button>
                    </div>
                </div>
            )
        }

        // Verificar si está en el dashboard correcto
        const dashboardPath = `${ROUTES.RESTAURANT}${restaurantId}/dashboard`
        const isDashboardRoute = pathname === dashboardPath || pathname?.startsWith(`${ROUTES.RESTAURANT}${restaurantId}/dashboard`)

        // Si no está en el dashboard y ya intentamos redirigir, mostrar loading
        if (!isDashboardRoute && hasRedirected) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--background)',
                    color: 'white'
                }}>
                    Redirigiendo a tu dashboard...
                </div>
            )
        }
    }

    // Todo está bien, renderizar children
    return <>{children}</>
}