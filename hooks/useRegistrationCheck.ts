import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export function useRegistrationCheck() {
    const { token, loading, user } = useAuth()
    const [estado, setEstado] = useState({ checking: true, incompleto: false, paso: 1 })

    useEffect(() => {
        if (loading || !token || !user) return

        const verify = async () => {
            try {
                const res = await fetch('/api/usuario/estado-registro')
                if (!res.ok) {
                    setEstado({ checking: false, incompleto: false, paso: 1 })
                    return
                }

                const data = await res.json()
                // El backend ahora solo devuelve { registroCompleto: boolean }
                if (!data.registroCompleto) {
                    setEstado({
                        checking: false,
                        incompleto: true,
                        paso: 1 // Siempre redirigir al paso 1 si no está completo
                    })
                } else {
                    setEstado({ checking: false, incompleto: false, paso: 1 })
                }
            } catch {
                setEstado({ checking: false, incompleto: false, paso: 1 })
            }
        }

        verify()
    }, [token, loading, user])

    return estado
}




