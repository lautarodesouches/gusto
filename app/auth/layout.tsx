'use client'
import styles from './page.module.css'
import { usePathname } from 'next/navigation'

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const pathname = usePathname()
    const isStepRoute = pathname?.includes('/step/')

    return (
        <main className={`${styles.main} ${isStepRoute ? styles.stepRoute : ''}`}>
            <div className={styles.main__div}>{children}</div>
            {!isStepRoute && (
                <aside className={styles.main__aside}>
                    
                </aside>
            )}
        </main>
    )
}
