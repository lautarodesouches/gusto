'use client'
import styles from './styles.module.css'
import Image from 'next/image'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faUser } from '@fortawesome/free-solid-svg-icons'
import { ROUTES } from '@/routes'

interface Props {
    activeView: 'inicio' | 'grupo'
}

export default function Nav({ activeView }: Props) {
    return (
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
    )
}
