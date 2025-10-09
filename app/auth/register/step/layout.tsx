'use client'
import { RegisterProvider } from '@/context/RegisterContext'
import styles from './page.module.css'
import { AuthProgress } from '@/components'
import Image from 'next/image'

interface Props {
    children: React.ReactNode
}

export default function Layout({ children }: Props) {
    return (
        <RegisterProvider>
            <div className={`${styles.wrapper} step-layout`}>
                <header className={styles.header}>
                    <Image
                        src="/images/brand/gusto-center-negative.svg"
                        alt="Logo Gusto!"
                        className={styles.logo}
                        width={120}
                        height={40}
                        priority
                    />
                </header>
                <div className={styles.container}>
                    <aside className={styles.progress}>
                        <AuthProgress />
                    </aside>
                    <div className={styles.content}>{children}</div>
                </div>
            </div>
        </RegisterProvider>
    )
}
