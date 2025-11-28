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
        // Verificar si es ruta pública PRIMERO
        const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname?.startsWith(route))
        
        // No hacer nada en rutas públicas
        if (isPublicRoute) {
            setEstado({ checking: false, incompleto: false, paso: 1, mostrarModal: false })
            return
        }

        // Solo verificar registro en rutas no públicas
        if (loading || !token || !user) {
            setEstado({ checking: true, incompleto: false, paso: 1, mostrarModal: false })
            return
        }

        const verify = async () => {
            try {
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




