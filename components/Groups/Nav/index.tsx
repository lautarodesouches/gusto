'use client'
import styles from './styles.module.css'
import Image from 'next/image'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'

import { ROUTES } from '@/routes'
import { ActiveView } from '../Client'
import NotificationBell from '@/components/NotificationBell/Notificacion'
import { FriendRequests } from '@/components'
import Switch from '../Switch'

interface Props {
    activeView: ActiveView
    mobileView: 'social' | 'group'
    onClick: (view: ActiveView) => void
}

export default function Nav({ activeView, mobileView, onClick }: Props) {
    return (
        <nav className={styles.nav}>
            <div
                className={`${styles.nav__logo} ${
                    mobileView === 'social' ? styles.show : ''
                }`}
            >
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
            <div
                className={`${styles.nav__switch} ${
                    mobileView === 'group' ? styles.show : ''
                }`}
            >
                <Switch activeView={activeView} onClick={onClick} />
            </div>
            <div className={styles.nav__icons}>
                <FriendRequests />
                <NotificationBell />

                <Link
                    href={`${ROUTES.PROFILE}lautarodesouches`}
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
    )
}
