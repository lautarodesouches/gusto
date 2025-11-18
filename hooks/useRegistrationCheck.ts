import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export function useRegistrationCheck() {
    const { token, loading, user } = useAuth()
    const [estado, setEstado] = useState({ 
        checking: true, 
        incompleto: false, 
        paso: 1,
        mostrarModal: false 
    })

    useEffect(() => {
        if (loading || !token || !user) return

        const verify = async () => {
            try {
                const res = await fetch('/api/usuario/estado-registro')
                if (!res.ok) {
                    setEstado({ checking: false, incompleto: false, paso: 1, mostrarModal: false })
                    return
                }

                const data = await res.json()
                if (!data.registroCompleto) {
                    setEstado({
                        checking: false,
                        incompleto: true,
                        paso: 1,
                        mostrarModal: true
                    })
                } else {
                    setEstado({ checking: false, incompleto: false, paso: 1, mostrarModal: false })
                }
            } catch {
                setEstado({ checking: false, incompleto: false, paso: 1, mostrarModal: false })
            }
        }

        verify()
    }, [token, loading, user])

    return estado
}




