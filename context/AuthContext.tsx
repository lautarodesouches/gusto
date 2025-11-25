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
            
            // Esperar un poco para que Firebase procese los nuevos claims
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Después de refrescar claims, forzar la renovación del token para obtener los nuevos claims
            const currentUser = auth.currentUser
            if (currentUser) {
                console.log('[Auth] 🔄 Forzando renovación del token para obtener nuevos claims...')
                const newToken = await currentUser.getIdToken(true) // true = force refresh
                
                // Actualizar el token en el estado inmediatamente
                setToken(newToken)
                
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
        await signOut(auth)
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
