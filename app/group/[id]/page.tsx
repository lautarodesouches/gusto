import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faUser,
    faExclamationTriangle,
    faLock,
} from '@fortawesome/free-solid-svg-icons'
import styles from './page.module.css'
import { Group } from '@/types'
import { ROUTES } from '@/routes'
import { LOCAL_URL } from '@/constants'
import { GroupClient, FriendRequests } from '@/components'
import admin from '@/lib/firebaseAdmin'
import NotificationBell from '@/components/NotificationBell/Notificacion'
import Navbar from '@/components/Navbar'

interface Props {
    params: Promise<{ id: string }>
}

interface GroupError {
    status: number
    message: string
}

//  1. Función para obtener datos del grupo (desde el servidor)
async function fetchGroup({
    id,
    cookie,
}: {
    id: string
    cookie: string
}): Promise<Group | GroupError> {
    try {
        const res = await fetch(`${LOCAL_URL}/api/group/${id}`, {
            headers: { cookie },
            cache: 'no-store',
        })

        if (res.status === 401) redirect(ROUTES.LOGIN)

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            const errorMessage =
                errorData.error || errorData.message || 'Error desconocido'

            // Retornar información del error para manejo específico
            return {
                status: res.status,
                message: errorMessage,
            } as GroupError
        }

        return await res.json()
    } catch (error) {
        console.error(`Error fetching group ${id}:`, error)
        return {
            status: 500,
            message: 'Error al conectar con el servidor',
        } as GroupError
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

// Componente de error para grupos
function GroupErrorView({ error }: { error: GroupError }) {
    const getErrorContent = () => {
        switch (error.status) {
            case 403:
                return {
                    icon: faLock,
                    title: 'Acceso denegado',
                    message:
                        'No eres miembro de este grupo. Debes ser invitado para acceder.',
                    showRetry: false,
                }
            case 400:
                return {
                    icon: faExclamationTriangle,
                    title: 'ID de grupo inválido',
                    message:
                        error.message || 'El ID proporcionado no es válido.',
                    showRetry: false,
                }
            case 404:
                return {
                    icon: faExclamationTriangle,
                    title: 'Grupo no encontrado',
                    message:
                        'El grupo que buscas no existe o ha sido eliminado.',
                    showRetry: false,
                }
            default:
                return {
                    icon: faExclamationTriangle,
                    title: 'Error al cargar el grupo',
                    message:
                        error.message ||
                        'Ocurrió un error inesperado. Por favor, intenta más tarde.',
                    showRetry: true,
                }
        }
    }

    const content = getErrorContent()

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
                    <FriendRequests />
                    <NotificationBell />
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

            <div className={styles.errorContainer}>
                <div className={styles.errorContent}>
                    <FontAwesomeIcon
                        icon={content.icon}
                        className={styles.errorIcon}
                    />
                    <h2 className={styles.errorTitle}>{content.title}</h2>
                    <p className={styles.errorMessage}>{content.message}</p>
                    <Link href={ROUTES.MAP} className={styles.errorButton}>
                        Volver al mapa
                    </Link>
                </div>
            </div>
        </main>
    )
}

export default async function GroupDetail({ params }: Props) {
    const { id } = await params

    await verifyAuthentication()

    const headersList = await headers()
    const cookie = headersList.get('cookie') || ''

    const result = await fetchGroup({ id, cookie })

    if ('status' in result && 'message' in result) {
        return <GroupErrorView error={result} />
    }

    const group = result as Group

    return (
        <div className={styles.wrapper}>
            <Navbar />
            <main className={styles.main}>
                <GroupClient group={group} />
            </main>
        </div>
    )
}
