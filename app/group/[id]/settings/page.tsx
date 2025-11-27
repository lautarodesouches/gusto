import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import { ROUTES } from '@/routes'
import { Group } from '@/types'
import admin from '@/lib/firebaseAdmin'
import Navbar from '@/components/Navbar'
import GroupSettings from '@/components/Groups/Settings'
import { getGroup } from '@/app/actions/groups'
import styles from './page.module.css'

interface Props {
    params: Promise<{ id: string }>
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

    const groupResponse = await getGroup(id)
    const group = groupResponse.success ? groupResponse.data : null

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
