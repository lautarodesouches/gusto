'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUserRole } from '@/hooks/useUserRole'
import { useMyRestaurant } from '@/hooks/useMyRestaurant'
import { useAuth } from '@/context/AuthContext'
import { logout as logoutAction } from '@/app/actions/login'
import PendienteRestauranteBlocked from '@/components/BlockedView/PendienteRestaurante'
import { ROUTES } from '@/routes'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'

// Rutas públicas que siempre están permitidas
const PUBLIC_ROUTES = [
    '/auth/login',
    '/auth/register',
    '/auth/restaurant',
    '/',
]

// Rutas permitidas para dueños de restaurante
// El dashboard se verifica dinámicamente con el restaurantId, pero también se incluye aquí
const DUENO_RESTAURANTE_ALLOWED_ROUTES = [
    '/restaurante/', // Para acceder a su dashboard específico (se verifica dinámicamente después)
    '/configuracion', // Configuración del perfil
    '/api/restaurantes/dashboard', // API del dashboard
]

/**
 * Componente que protege las rutas según el rol del usuario
 */
export default function RoleProtection({ children }: { children: React.ReactNode }) {
    const { isLoading, isPendienteRestaurante, isDuenoRestaurante } = useUserRole()
    const { restaurantId, isLoading: isLoadingRestaurant } = useMyRestaurant()
    const { logout } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [isChecking, setIsChecking] = useState(true)
    const [shouldBlock, setShouldBlock] = useState(false)
    const [hasRedirected, setHasRedirected] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

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
        }
    }

    useEffect(() => {
        // Verificar si es una ruta pública
        const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname?.startsWith(route))
        
        // Si aún está cargando, esperar
        if (isLoading || isLoadingRestaurant) {
            // Si es ruta pública y no es DuenoRestaurante, permitir continuar
            if (isPublicRoute && !isDuenoRestaurante) {
                setShouldBlock(false)
                setIsChecking(false)
                setHasRedirected(false)
            }
            return
        }

        // Si es PendienteRestaurante, bloquear todo excepto la vista de bloqueo
        if (isPendienteRestaurante) {
            setShouldBlock(true)
            setIsChecking(false)
            setHasRedirected(false) // Resetear cuando es PendienteRestaurante
            return
        }

        // Si es DuenoRestaurante, redirigir automáticamente a su dashboard
        // IMPORTANTE: Esto debe ejecutarse ANTES de verificar rutas públicas
        // para asegurar que siempre redirija al dashboard, incluso desde /mapa
        if (isDuenoRestaurante) {
            // Si aún está cargando el restaurante, esperar
            if (isLoadingRestaurant) {
                setIsChecking(true)
                return
            }
            
            // Si no tiene restaurante después de cargar, mostrar error
            if (!restaurantId) {
                setIsChecking(false)
                setHasRedirected(false)
                return
            }
            
            // Construir la ruta del dashboard
            const dashboardPath = `${ROUTES.RESTAURANT}${restaurantId}/dashboard`
            // Verificación más estricta: debe ser exactamente el dashboard o una subruta válida
            // Ejemplo: /restaurante/123/dashboard o /restaurante/123/dashboard/...
            // Pero NO: /restaurante/123/dashboard-otro
            const dashboardBasePath = `${ROUTES.RESTAURANT}${restaurantId}/dashboard`
            const isDashboardRoute = pathname === dashboardPath || 
                (pathname?.startsWith(dashboardBasePath) && 
                 (pathname.length === dashboardBasePath.length || pathname[dashboardBasePath.length] === '/'))
            
            // Verificar si está intentando acceder a otro restaurante (no permitido)
            // Si está en /restaurante/[id] pero el ID no coincide con su restaurante, redirigir
            if (pathname?.startsWith(ROUTES.RESTAURANT) && !pathname.startsWith(dashboardBasePath)) {
                // Extraer el ID del pathname
                const pathParts = pathname.replace(ROUTES.RESTAURANT, '').split('/')
                const restaurantIdInPath = pathParts[0]
                // Si el ID en la URL no coincide con su restaurante, redirigir
                if (restaurantIdInPath && restaurantIdInPath !== restaurantId) {
                    if (!hasRedirected) {
                        setHasRedirected(true)
                        setIsChecking(false)
                        window.location.href = dashboardPath
                    }
                    return
                }
            }
            
            // Verificar si está en una ruta permitida (dashboard o rutas adicionales)
            const isAllowedRoute = isDashboardRoute || 
                DUENO_RESTAURANTE_ALLOWED_ROUTES.some(route => pathname === route || pathname?.startsWith(route))
            
            // Si no está en una ruta permitida, redirigir al dashboard
            if (!isAllowedRoute) {
                // Solo redirigir si no hemos redirigido recientemente (evitar loops)
                if (!hasRedirected) {
                    setHasRedirected(true)
                    setIsChecking(false)
                    // Usar window.location para forzar la navegación completa
                    window.location.href = dashboardPath
                }
                return
            }
            
            // Si ya está en una ruta permitida, permitir continuar
            if (isAllowedRoute) {
                setShouldBlock(false)
                setIsChecking(false)
                // Resetear hasRedirected cuando estamos en la ruta correcta
                setHasRedirected(false)
                return
            }
        }

        // Si no es DuenoRestaurante, resetear hasRedirected
        setHasRedirected(false)
        setShouldBlock(false)
        setIsChecking(false)
    }, [isLoading, isLoadingRestaurant, isPendienteRestaurante, isDuenoRestaurante, restaurantId, pathname, hasRedirected])

    // No renderizar nada hasta que se verifique el rol y el restaurante (si es dueño)
    // Si es DuenoRestaurante, esperar a que termine de cargar el restaurantId antes de mostrar error
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
        
        // Si tiene restaurante pero está redirigiendo, mostrar loading
        if (restaurantId && hasRedirected) {
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

