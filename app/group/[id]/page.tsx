import { notFound, redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faUser } from '@fortawesome/free-solid-svg-icons'
import styles from './page.module.css'
import { Group } from '@/types'
import { ROUTES } from '@/routes'
import { LOCAL_URL } from '@/constants'
import { GroupClient, GroupsSocial } from '@/components'
import admin from '@/lib/firebaseAdmin'
import NotificationBell from '@/components/NotificationBell/Notificacion'

interface Props {
    params: Promise<{ id: string }>
}

//  1. Función para obtener datos del grupo (desde el servidor)
async function fetchGroup({
    id,
    cookie,
}: {
    id: string
    cookie: string
}): Promise<Group> {
    try {
        const res = await fetch(`${LOCAL_URL}/api/group/${id}`, {
            headers: { cookie },
            cache: 'no-store',
        })

        if (res.status === 401) redirect(ROUTES.LOGIN)
        if (!res.ok) {
            console.error(`Error fetching group ${id}: Status ${res.status}`)
            notFound()
        }

        return await res.json()
    } catch (error) {
        console.error(`Error fetching group ${id}:`, error)
        notFound()
    }
}

//  2. Función para verificar autenticación (usa Firebase Admin)
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

//  3. Componente principal del servidor
export default async function GroupDetail({ params }: Props) {
    const { id } = await params

    // Verificar autenticación
    const userId = await verifyAuthentication()

    // Obtener cookies/headers para fetch
    const headersList = await headers()
    const cookie = headersList.get('cookie') || ''

    // Obtener datos del grupo
    const group = await fetchGroup({ id, cookie })

    // Verificar si es administrador (opcional)
    const isAdmin = group.administradorFirebaseUid === userId

    //  Render
    return (
        <main className={styles.main}>
            <GroupClient group={group} />
        </main>
    )
}
