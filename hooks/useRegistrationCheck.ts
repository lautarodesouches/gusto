import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { usePathname } from 'next/navigation'
import { getRegistrationStatus } from '@/app/actions/profile'

const PUBLIC_ROUTES = [
    '/auth/login',
    '/auth/register',
    '/auth/restaurant',
    '/',
]

export function useRegistrationCheck() {
    const { token, loading, user } = useAuth()
    const pathname = usePathname()
    const [estado, setEstado] = useState({ 
        checking: true, 
        incompleto: false, 
        paso: 1,
        mostrarModal: false 
    })

    useEffect(() => {
        const isPublicRoute = PUBLIC_ROUTES.some(route => {
            if (!pathname) return false
            if (route === '/') return pathname === '/'
            return pathname === route || pathname.startsWith(route)
        })

        const normalizedPath = pathname?.replace(/\/$/, '') || ''
        const isMapaRoute = normalizedPath === '/mapa'

        if (isPublicRoute || !isMapaRoute) {
            setEstado({ checking: false, incompleto: false, paso: 1, mostrarModal: false })
            return
        }

        if (loading) {
            setEstado(prev => ({ ...prev, checking: true }))
            return
        }

        if (!token || !user) {
            setEstado({ checking: false, incompleto: false, paso: 1, mostrarModal: false })
            return
        }

        const verify = async () => {
            try {
                setEstado(prev => ({ ...prev, checking: true }))
                const result = await getRegistrationStatus()

                if (result.success && result.data) {
                    if (!result.data.registroCompleto) {
                        setEstado({
                            checking: false,
                            incompleto: true,
                            paso: 1,
                            mostrarModal: true
                        })
                    } else {
                        setEstado({ checking: false, incompleto: false, paso: 1, mostrarModal: false })
                    }
                } else {
                    setEstado({ checking: false, incompleto: false, paso: 1, mostrarModal: false })
                }
            } catch {
                setEstado({ checking: false, incompleto: false, paso: 1, mostrarModal: false })
            }
        }

        verify()
    }, [token, loading, user, pathname])

    return estado
}




