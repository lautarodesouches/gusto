import styles from './page.module.css'
import { Group } from '@/types'
import { notFound, redirect } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faUser } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'
import Link from 'next/link'
import { ROUTES } from '@/routes'
import { GroupsSocial } from '@/components'
import { LOCAL_URL } from '@/constants'
import { cookies, headers } from 'next/headers'
import admin from '@/lib/firebaseAdmin'

const fetchGroup = async (id: string): Promise<Group> => {
    const headersList = await headers()
    const cookie = headersList.get('cookie') || ''

    try {
        const res = await fetch(`${LOCAL_URL}/api/group/${id}`, {
            headers: {
                cookie,
            },
            cache: 'no-store',
        })

        if (!res.ok) throw new Error()

        const data: Group = await res.json()

        return data
    } catch {
        notFound()
    }
}

type Props = {
    params: Promise<{ id: string }>
}

export default async function GroupDetail({ params }: Props) {
    const { id } = await params

    const group = await fetchGroup(id)

    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) return redirect(ROUTES.LOGIN)

    const decoded = await admin.auth().verifyIdToken(token)

    const userId = decoded.uid

    const isAdmin = group.administradorFirebaseUid === userId

    return (
        <main className={styles.main}>
            <nav className={styles.nav}>
                <div className={styles.nav__logo}>
                    <Link href={ROUTES.MAP}>
                        <Image
                            src="/images/brand/gusto-center-negative.svg"
                            alt="Logo Gusto!"
                            className={styles.nav__img}
                            width={0}
                            height={0}
                            priority
                        />
                    </Link>
                </div>
                <div className={styles.nav__icons}>
                    <div className={styles.nav__div}>
                        <FontAwesomeIcon
                            icon={faBell}
                            className={styles.nav__icon}
                        />
                    </div>
                    <div className={styles.nav__div}>
                        <FontAwesomeIcon
                            icon={faUser}
                            className={styles.nav__icon}
                        />
                    </div>
                </div>
            </nav>
            <GroupsSocial group={group} />
        </main>
    )
}
