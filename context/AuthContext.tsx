'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged, signOut } from 'firebase/auth'
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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
            if (firebaseUser) {
                setUser(firebaseUser)

                // 🔑 obtener token actualizado
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
