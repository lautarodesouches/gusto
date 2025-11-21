import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import { ROUTES } from '@/routes'
import { Group } from '@/types'
import admin from '@/lib/firebaseAdmin'
import Navbar from '@/components/Navbar'
import GroupSettings from '@/components/Groups/Settings'
import styles from './page.module.css'

interface Props {
    params: Promise<{ id: string }>
}

async function fetchGroup({
    id,
    cookie,
}: {
    id: string
    cookie: string
}): Promise<Group | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || 'http://localhost:3000'
        const apiUrl = `${baseUrl}/api/group/${id}`
        
        const res = await fetch(apiUrl, {
            headers: { cookie },
            cache: 'no-store',
        })

        if (res.status === 401) redirect(ROUTES.LOGIN)
        if (!res.ok) return null

        return await res.json()
    } catch (error) {
        console.error(`Error fetching group ${id}:`, error)
        return null
    }
}

async function verifyAuthentication(): Promise<string> {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) redirect(ROUTES.LOGIN)

    try {
        const decoded = await admin.auth().verifyIdToken(token)
        return decoded.uid
    } catch (error) {
        console.error('Error verifying token:', error)
        redirect(ROUTES.LOGIN)
    }
}

export default async function GroupSettingsPage({ params }: Props) {
    const { id } = await params
    const userId = await verifyAuthentication()

    const headersList = await headers()
    const cookie = headersList.get('cookie') || ''

    const group = await fetchGroup({ id, cookie })

    if (!group) {
        redirect(`${ROUTES.GROUP}${id}`)
    }

    const isAdmin = group.administradorFirebaseUid === userId

    return (
        <div className={styles.wrapper}>
            <Navbar />
            <main className={styles.main}>
                <GroupSettings group={group} isAdmin={isAdmin} userId={userId} />
            </main>
        </div>
    )
}
