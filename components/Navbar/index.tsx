'use client'

import styles from './styles.module.css'
import Image from 'next/image'
import Link from 'next/link'
import { ROUTES } from '@/routes'
import { usePathname } from 'next/navigation'
import ProfileBar from './ProfileBar'

interface NavbarProps {
    title?: string
}

export default function Navbar({ title }: NavbarProps) {
    const pathname = usePathname()
    
    // No mostrar Navbar en el mapa
    if (pathname?.startsWith('/mapa')) {
        return null
    }

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
                
                {title && (
                    <h1 className={styles.title}>{title}</h1>
                )}
                
                <div className={styles.profileBar}>
                    <ProfileBar />
                </div>
            </div>
        </header>
    )
}
