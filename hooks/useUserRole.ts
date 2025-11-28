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
function decodeJWT(token: string): { rol?: string | number;[key: string]: unknown } | null {
    try {
        const parts = token.split('.')
        if (parts.length !== 3) return null

        const payload = parts[1]
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        return JSON.parse(decoded) as { rol?: string | number;[key: string]: unknown }
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

        if (tokenPayload?.rol !== undefined && tokenPayload?.rol !== null) {
            const rolValue: string | number = tokenPayload.rol
            const rolString = String(rolValue).trim()
            let mappedRol: RolUsuario

            // Mapear tanto strings como números - manejar todos los casos posibles
            // Caso 1: String "Admin", "DuenoRestaurante", etc.
            if (rolString === 'Admin' || rolString === 'ADMIN' || rolString === 'admin') {
                mappedRol = RolUsuario.Admin
            } else if (rolString === 'DuenoRestaurante' || rolString === 'DUENORESTAURANTE' || rolString === 'duenoRestaurante') {
                mappedRol = RolUsuario.DuenoRestaurante
            } else if (rolString === 'PendienteRestaurante' || rolString === 'PENDIENTERESTAURANTE' || rolString === 'pendienteRestaurante') {
                mappedRol = RolUsuario.PendienteRestaurante
            }
            // Caso 2: Número como string "3", "2", "1" o número directo 3, 2, 1
            else if (rolString === '3' || (typeof rolValue === 'number' && rolValue === 3)) {
                mappedRol = RolUsuario.Admin
            } else if (rolString === '2' || (typeof rolValue === 'number' && rolValue === 2)) {
                mappedRol = RolUsuario.DuenoRestaurante
            } else if (rolString === '1' || (typeof rolValue === 'number' && rolValue === 1)) {
                mappedRol = RolUsuario.PendienteRestaurante
            }
            // Caso 3: Número directo (sin convertir a string) - ya manejado arriba, pero por si acaso
            else if (typeof rolValue === 'number') {
                if (rolValue === 3) {
                    mappedRol = RolUsuario.Admin
                } else if (rolValue === 2) {
                    mappedRol = RolUsuario.DuenoRestaurante
                } else if (rolValue === 1) {
                    mappedRol = RolUsuario.PendienteRestaurante
                } else {
                    mappedRol = RolUsuario.Usuario
                }
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

    // Escuchar evento de token refrescado para forzar actualización del rol
    useEffect(() => {
        const handleTokenRefreshed = () => {
            // Forzar re-ejecución del efecto anterior
            if (token) {
                const tokenPayload = decodeJWT(token)
                if (tokenPayload?.rol) {
                    const rolString = String(tokenPayload.rol)
                    const rolValue = tokenPayload.rol
                    let mappedRol: RolUsuario

                    if (rolString === 'PendienteRestaurante' || rolString === '1' || (typeof rolValue === 'number' && rolValue === 1)) {
                        mappedRol = RolUsuario.PendienteRestaurante
                    } else if (rolString === 'DuenoRestaurante' || rolString === '2' || (typeof rolValue === 'number' && rolValue === 2)) {
                        mappedRol = RolUsuario.DuenoRestaurante
                    } else if (rolString === 'Admin' || rolString === '3' || (typeof rolValue === 'number' && rolValue === 3) || tokenPayload.rol === '3') {
                        mappedRol = RolUsuario.Admin
                    } else {
                        mappedRol = RolUsuario.Usuario
                    }

                    setRol(mappedRol)
                    setIsLoading(false)
                }
            }
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('token:refreshed', handleTokenRefreshed)
            return () => window.removeEventListener('token:refreshed', handleTokenRefreshed)
        }
    }, [token])

    return {
        rol,
        isLoading,
        isPendienteRestaurante: rol === RolUsuario.PendienteRestaurante,
        isDuenoRestaurante: rol === RolUsuario.DuenoRestaurante,
        isAdmin: rol === RolUsuario.Admin,
        isUsuario: rol === RolUsuario.Usuario || rol === null,
    }
}

