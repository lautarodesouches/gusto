'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import {
    User,
    onAuthStateChanged,
    onIdTokenChanged,
    signOut,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { verifyPremiumStatus } from '@/app/actions/payment'
import { refreshClaims } from '@/app/actions/auth'
import { logout as logoutAction } from '@/app/actions/login'

type AuthContextType = {
    user: User | null
    token: string | null
    loading: boolean
    logout: () => Promise<void>
    isPremium: boolean
    refreshPremiumStatus: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [isPremium, setIsPremium] = useState(false)

    // Función para verificar el estado Premium
    const refreshPremiumStatus = async () => {
        if (!token) {
            setIsPremium(false)
            return
        }

        try {
            const result = await verifyPremiumStatus()
            
            if (result.success && result.data) {
                setIsPremium(result.data.isPremium || false)
            } else {
                setIsPremium(false)
            }
        } catch (error) {
            console.error('Error al verificar estado premium:', error)
            setIsPremium(false)
        }
    }

    // Función para refrescar los claims de Firebase después del login
    const refreshFirebaseClaims = async (token: string) => {
        try {
            console.log('[Auth] 🔄 Refrescando claims de Firebase...')
            
            // Llamar al endpoint para refrescar claims (actualiza el rol en Firebase)
            const result = await refreshClaims()
            
            if (!result.success) {
                console.error('[Auth] ❌ Error al refrescar claims:', result.error)
                return
            }
            
            console.log('[Auth] ✅ Claims refrescados en Firebase')
            
            // Esperar más tiempo en producción para que Firebase procese los nuevos claims
            // Firebase puede tardar unos segundos en propagar los custom claims
            const waitTime = process.env.NODE_ENV === 'production' ? 2000 : 1000
            console.log('[Auth] ⏳ Esperando', waitTime, 'ms para que Firebase procese los claims...')
            await new Promise(resolve => setTimeout(resolve, waitTime))
            
            // Después de refrescar claims, forzar la renovación del token para obtener los nuevos claims
            const currentUser = auth.currentUser
            if (currentUser) {
                console.log('[Auth] 🔄 Forzando renovación del token para obtener nuevos claims...')
                
                // Intentar renovar el token hasta 3 veces si no tiene el claim
                let newToken = await currentUser.getIdToken(true) // true = force refresh
                let attempts = 0
                const maxAttempts = 3
                
                while (attempts < maxAttempts) {
                    // Decodificar el token para verificar que tiene el rol
                    try {
                        const parts = newToken.split('.')
                        if (parts.length === 3) {
                            const payload = parts[1]
                            const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
                            const hasRol = decoded.rol !== undefined && decoded.rol !== null
                            
                            console.log(`[Auth] 🔍 Intento ${attempts + 1}: Token tiene claim "rol":`, hasRol, 'valor:', decoded.rol)
                            
                            if (hasRol) {
                                console.log('[Auth] ✅ Token renovado con claim de rol')
                                break
                            }
                        }
                    } catch (e) {
                        console.warn('[Auth] ⚠️ Error decodificando token:', e)
                    }
                    
                    // Si no tiene el claim, esperar y reintentar
                    if (attempts < maxAttempts - 1) {
                        console.log(`[Auth] ⏳ Token sin claim de rol, esperando 1s y reintentando... (intento ${attempts + 2}/${maxAttempts})`)
                        await new Promise(resolve => setTimeout(resolve, 1000))
                        newToken = await currentUser.getIdToken(true)
                    }
                    attempts++
                }
                
                // Actualizar el token en el estado inmediatamente
                setToken(newToken)
                
                // Decodificar el nuevo token para verificar que tiene el rol actualizado
                try {
                    const parts = newToken.split('.')
                    if (parts.length === 3) {
                        const payload = parts[1]
                        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
                        console.log('[Auth] 🔍 Nuevo token decodificado:', decoded)
                        console.log('[Auth] 🔍 Claim "rol" en nuevo token:', decoded.rol, 'tipo:', typeof decoded.rol)
                        
                        if (!decoded.rol && attempts >= maxAttempts) {
                            console.warn('[Auth] ⚠️ Token renovado pero aún no tiene claim de rol. Puede tardar unos segundos más.')
                        }
                    }
                } catch (e) {
                    console.warn('[Auth] ⚠️ No se pudo decodificar el token para verificar:', e)
                }
                
                // Actualizar la cookie en el backend con el nuevo token
                try {
                    await fetch('/api/refresh-token', {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${newToken}`,
                        },
                    })
                    console.log('[Auth] ✅ Token actualizado en cookie')
                } catch (error) {
                    console.error('[Auth] ❌ Error al actualizar cookie:', error)
                }
                
                // Forzar actualización del rol disparando un evento personalizado
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('token:refreshed'))
                }
            }
        } catch (error) {
            console.error('[Auth] ❌ Error al refrescar claims de Firebase:', error)
            // No lanzar error, solo loguear - no es crítico si falla
        }
    }

    //  Maneja cambios de autenticación (login/logout)
    useEffect(() => {
        let isFirstLogin = true // Track si es el primer login en esta sesión
        
        const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
            if (firebaseUser) {
                setUser(firebaseUser)
                const freshToken = await firebaseUser.getIdToken()
                setToken(freshToken)
                
                // Refrescar claims automáticamente después del primer login
                // Solo la primera vez que se detecta un usuario (login)
                if (isFirstLogin) {
                    isFirstLogin = false
                    // Esperar más tiempo en producción para asegurar que la cookie esté establecida
                    // y que el backend esté listo (puede haber latencia de red)
                    const delay = process.env.NODE_ENV === 'production' ? 1500 : 500
                    setTimeout(() => {
                        refreshFirebaseClaims(freshToken)
                    }, delay)
                }
            } else {
                setUser(null)
                setToken(null)
                setIsPremium(false)
                isFirstLogin = true // Reset para el próximo login
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    // Verificar estado Premium cuando cambie el token
    useEffect(() => {
        if (token && !loading) {
            refreshPremiumStatus()
        }
    }, [token, loading])

    //  Refresca token automáticamente cada vez que Firebase lo renueva
    useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, async firebaseUser => {
            if (firebaseUser) {
                const newToken = await firebaseUser.getIdToken()
                setToken(newToken)

                // 🔁 Actualiza la cookie HttpOnly en el backend
                try {
                    await fetch('/api/refresh-token', {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${newToken}`,
                        },
                    })
                } catch (error) {
                    console.error('Error al refrescar token:', error)
                }
            }
        })

        return () => unsubscribe()
    }, [])

    const logout = async () => {
        try {
            await signOut(auth)
            await logoutAction()
        } catch (error) {
            console.error('Error al cerrar sesión:', error)
        }
        setUser(null)
        setToken(null)
        setIsPremium(false)
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, logout, isPremium, refreshPremiumStatus }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth debe usarse dentro de un AuthProvider')
    return ctx
}
