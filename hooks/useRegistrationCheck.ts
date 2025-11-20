import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getRegistrationStatus } from '@/app/actions/profile'

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
    }, [token, loading, user])

    return estado
}




