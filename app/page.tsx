import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/routes'
import { verifyFirebaseToken } from '@/lib/firebaseAdmin'

export default async function Home() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
        redirect(ROUTES.LOGIN)
    }

    try {
        //await verifyFirebaseToken(token)
        redirect(ROUTES.MAP)
    } catch (error) {
        console.error('Token inválido:', error)
        redirect(ROUTES.LOGIN)
    }
}
