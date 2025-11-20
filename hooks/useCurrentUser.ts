'use client'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/app/actions/profile'

export function useCurrentUser() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const result = await getCurrentUser()
                if (result.success && result.data) {
                    setUser(result.data)
                } else {
                    setUser(null)
                }
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

