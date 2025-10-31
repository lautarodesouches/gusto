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
import { GroupsSocial } from '@/components'
import admin from '@/lib/firebaseAdmin'

interface Props {
    params: Promise<{ id: string }>
}

// Obtiene los datos de un grupo desde la API
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

        // Redirigir si no está autenticado
        if (res.status === 401) redirect(ROUTES.LOGIN)

        // Si no es exitoso, lanzar error para ir al 404
        if (!res.ok) {
            console.error(`Error fetching group ${id}: Status ${res.status}`)
            notFound()
        }

        const data: Group = await res.json()
        return data
    } catch (error) {
        // Si es un error de redirect, propagarlo
        if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
            throw error
        }

        console.error(`Error fetching group ${id}:`, error)
        notFound()
    }
}

// Verifica el token de autenticación y retorna el UID del usuario
async function verifyAuthentication(): Promise<string> {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
        redirect(ROUTES.LOGIN)
    }

    try {
        const decoded = await admin.auth().verifyIdToken(token)
        return decoded.uid
    } catch (error) {
        console.error('Error verifying token:', error)
        redirect(ROUTES.LOGIN)
    }
}

export default async function GroupDetail({ params }: Props) {
    // 1. Obtener parámetros
    const { id } = await params

    // 2. Verificar autenticación (esto también redirige si falla)
    const userId = await verifyAuthentication()

    // 3. Obtener headers para fetch
    const headersList = await headers()
    const cookie = headersList.get('cookie') || ''

    // 4. Obtener datos del grupo
    const group = await fetchGroup({ id, cookie })

    // 5. Verificar permisos de administrador
    const isAdmin = group.administradorFirebaseUid === userId

    return (
        <main className={styles.main}>
            <nav className={styles.nav}>
                <div className={styles.nav__logo}>
                    <Link href={ROUTES.MAP} aria-label="Ir al mapa">
                        <Image
                            src="/images/brand/gusto-center-negative.svg"
                            alt="Logo Gusto!"
                            className={styles.nav__img}
                            width={120}
                            height={40}
                            priority
                        />
                    </Link>
                </div>
                <div className={styles.nav__icons}>
                    <button
                        className={styles.nav__div}
                        aria-label="Notificaciones"
                        type="button"
                    >
                        <FontAwesomeIcon
                            icon={faBell}
                            className={styles.nav__icon}
                        />
                    </button>
                    <Link
                        href={ROUTES.PROFILE}
                        className={styles.nav__div}
                        aria-label="Perfil de usuario"
                    >
                        <FontAwesomeIcon
                            icon={faUser}
                            className={styles.nav__icon}
                        />
                    </Link>
                </div>
            </nav>
            <GroupsSocial group={group} />
        </main>
    )
}
