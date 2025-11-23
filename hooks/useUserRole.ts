'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { usePathname } from 'next/navigation'

export enum RolUsuario {
    Usuario = 'Usuario',
    PendienteRestaurante = 'PendienteRestaurante',
    DuenoRestaurante = 'DuenoRestaurante',
    Admin = 'Admin',
}

interface UserRoleResult {
    rol: RolUsuario | null
    isLoading: boolean
    isPendienteRestaurante: boolean
    isDuenoRestaurante: boolean
    isAdmin: boolean
    isUsuario: boolean
}

/**
 * Decodifica un JWT token (solo la parte del payload, sin verificación)
 * Útil para leer claims del token de Firebase en el cliente
 */
function decodeJWT(token: string): { rol?: string; [key: string]: unknown } | null {
    try {
        const parts = token.split('.')
        if (parts.length !== 3) return null
        
        const payload = parts[1]
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        return JSON.parse(decoded) as { rol?: string; [key: string]: unknown }
    } catch {
        return null
    }
}

/**
 * Hook para obtener y verificar el rol del usuario actual
 * Se actualiza automáticamente cuando cambia el token o el estado de autenticación
 * Primero intenta leer el rol del token de Firebase, luego verifica con el servidor
 */
export function useUserRole(): UserRoleResult {
    const { token, user, loading: authLoading } = useAuth()
    const pathname = usePathname()
    const [rol, setRol] = useState<RolUsuario | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Si aún está cargando la autenticación, esperar
        if (authLoading) {
            setIsLoading(true)
            return
        }

        // Si no hay token, el usuario no está autenticado
        if (!token || !user) {
            setRol(RolUsuario.Usuario)
            setIsLoading(false)
            return
        }

        // Primero intentar leer el rol directamente del token de Firebase (más rápido)
        const tokenPayload = decodeJWT(token)
        if (tokenPayload?.rol) {
            const rolString = String(tokenPayload.rol)
            let mappedRol: RolUsuario
            
            if (rolString === 'PendienteRestaurante') {
                mappedRol = RolUsuario.PendienteRestaurante
            } else if (rolString === 'DuenoRestaurante') {
                mappedRol = RolUsuario.DuenoRestaurante
            } else if (rolString === 'Admin') {
                mappedRol = RolUsuario.Admin
            } else {
                mappedRol = RolUsuario.Usuario
            }
            
            setRol(mappedRol)
            setIsLoading(false)
            return
        }

        // Si no hay rol en el token, verificar con el servidor
        const checkRole = async (retryCount = 0) => {
            try {
                setIsLoading(true)
                const response = await fetch('/api/usuario/rol', {
                    cache: 'no-store',
                    credentials: 'include',
                })
                
                if (response.ok) {
                    const data = await response.json()
                    const rolString = data.rol as string
                    
                    // Mapear el string del backend al enum
                    if (rolString === 'PendienteRestaurante') {
                        setRol(RolUsuario.PendienteRestaurante)
                    } else if (rolString === 'DuenoRestaurante') {
                        setRol(RolUsuario.DuenoRestaurante)
                    } else if (rolString === 'Admin') {
                        setRol(RolUsuario.Admin)
                    } else {
                        setRol(RolUsuario.Usuario)
                    }
                    setIsLoading(false)
                } else {
                    // Si falla y aún hay reintentos disponibles, reintentar después de un delay
                    if (retryCount < 3) {
                        setTimeout(() => {
                            checkRole(retryCount + 1)
                        }, 300 * (retryCount + 1)) // Delay incremental: 300ms, 600ms, 900ms
                        return
                    }
                    setRol(RolUsuario.Usuario) // Default después de todos los reintentos
                    setIsLoading(false)
                }
            } catch (error) {
                console.error('Error verificando rol:', error)
                // Si falla y aún hay reintentos disponibles, reintentar después de un delay
                if (retryCount < 3) {
                    setTimeout(() => {
                        checkRole(retryCount + 1)
                    }, 300 * (retryCount + 1)) // Delay incremental: 300ms, 600ms, 900ms
                    return
                }
                setRol(RolUsuario.Usuario) // Default después de todos los reintentos
                setIsLoading(false)
            }
        }

        // Delay inicial más corto ya que primero intentamos leer del token
        const delay = 100
        
        const timeoutId = setTimeout(() => {
            checkRole()
        }, delay)

        return () => clearTimeout(timeoutId)
    }, [token, user, authLoading, pathname]) // Agregar pathname para que se actualice después de navegación

    return {
        rol,
        isLoading,
        isPendienteRestaurante: rol === RolUsuario.PendienteRestaurante,
        isDuenoRestaurante: rol === RolUsuario.DuenoRestaurante,
        isAdmin: rol === RolUsuario.Admin,
        isUsuario: rol === RolUsuario.Usuario || rol === null,
    }
}

