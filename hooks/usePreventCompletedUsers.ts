import { useEffect} from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { pasoToNumber } from '@/utils'
import { getRegistrationStatus } from '@/app/actions/profile'

export function usePreventCompletedUsers() {
    const router = useRouter()
    const { token, loading, user } = useAuth()

    useEffect(() => {
        if (loading || !token || !user) return

        const verify = async () => {
            try {
                const result = await getRegistrationStatus()
                if (result.success && result.data?.registroCompleto) {
                    router.replace('/mapa')  
                }
            } catch (e) {
                console.error('usePreventCompletedUsers error', e)
            }
        }

        verify()
    }, [token, loading, user, router])
}
