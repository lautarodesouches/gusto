'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged, onIdTokenChanged, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

type AuthContextType = {
    user: User | null
    token: string | null
    loading: boolean
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    // 🔹 Maneja cambios de autenticación (login/logout)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
            if (firebaseUser) {
                setUser(firebaseUser)
                const freshToken = await firebaseUser.getIdToken()
                setToken(freshToken)
            } else {
                setUser(null)
                setToken(null)
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    // 🔄 Refresca token automáticamente cada vez que Firebase lo renueva
    useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const newToken = await firebaseUser.getIdToken()
                setToken(newToken)

                // 🔁 Actualiza la cookie HttpOnly en el backend
                try {
                    await fetch('/api/refresh-token', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${newToken}`,
                        },
                    })
                    console.log('🔄 Token Firebase actualizado en cookie')
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
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth debe usarse dentro de un AuthProvider')
    return ctx
}