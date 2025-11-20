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
    const [isPremium, setIsPremium] = useState(false) // TODO: Cambiar a false en producción

    // Función para verificar el estado Premium
    const refreshPremiumStatus = async () => {
        // 🔧 MODO TESTEO: Forzar isPremium a false
        setIsPremium(false)
        return
        
        /* // Descomentarizar en producción
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
        */
    }

    //  Maneja cambios de autenticación (login/logout)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
            if (firebaseUser) {
                setUser(firebaseUser)
                const freshToken = await firebaseUser.getIdToken()
                setToken(freshToken)
            } else {
                setUser(null)
                setToken(null)
                setIsPremium(false)
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
