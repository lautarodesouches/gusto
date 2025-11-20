
import { useEffect} from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { pasoToNumber } from '@/utils'

export function usePreventCompletedUsers() {
    const router = useRouter()
    const { token, loading, user } = useAuth()

    useEffect(() => {
        if (loading || !token || !user) return

        const verify = async () => {
            try {
                const res = await fetch('/api/usuario/estado-registro')
                if (!res.ok) return

                const data = await res.json()

                if (data.registroCompleto) {
                    router.replace('/mapa')  
                }
            } catch (e) {
                console.error('usePreventCompletedUsers error', e)
            }
        }

        verify()
    }, [token, loading, user, router])
}
