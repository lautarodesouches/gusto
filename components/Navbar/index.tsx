'use client'

import styles from './Navbar.module.css'
import Image from 'next/image'
import Link from 'next/link'
import { ROUTES } from '@/routes'
import ProfileBar from './ProfileBar'

export default function Navbar() {
    return (
        <header className={styles.header}>
            <div className={styles.header__content}>
                <Link href={ROUTES.MAP} className={styles.logo}>
                    <Image
                        src="/images/brand/gusto-center-negative.svg"
                        alt="Logo Gusto!"
                        width={120}
                        height={40}
                        priority
                    />
                </Link>
                
                <div className={styles.profileBar}>
                    <ProfileBar />
                </div>
            </div>
        </header>
    )
}
