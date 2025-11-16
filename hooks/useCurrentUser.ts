'use client'
import { useEffect, useState } from 'react'
export function useCurrentUser() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/usuario/me', { cache: 'no-store' })
                if (!res.ok) throw new Error()
                const data = await res.json()
                setUser(data)
            } catch {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    return { user, loading }
}

