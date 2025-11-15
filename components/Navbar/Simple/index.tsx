'use client'
import Link from 'next/link'
import { ROUTES } from '@/routes'
import styles from './styles.module.css'

export default function SimpleNavbar() {
    return (
        <header className={styles.header}>
            <div className={styles.header__brand}>
                <Link href={ROUTES.HOME}>
                    <span className={styles.header__logo}>GUSTO!</span>
                </Link>
                <span className={styles.header__title}>Opinion</span>
            </div>
        </header>
    )
}

