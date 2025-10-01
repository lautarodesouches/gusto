'use client'
import { RegisterProvider } from '@/context/RegisterContext'
import styles from './page.module.css'
import { AuthProgress } from '@/components'

interface Props {
    children: React.ReactNode
}

export default function Layout({ children }: Props) {
    return (
        <RegisterProvider>
            <div className={styles.container}>
                <aside className={styles.progress}>
                    <AuthProgress />
                </aside>
                <div>{children}</div>
            </div>
        </RegisterProvider>
    )
}
