import Navbar from '@/components/Navbar'
import { Metadata } from 'next'
import Settings from '@/components/Settings'

export const metadata: Metadata = {
    title: 'Configuración | Gusto',
    description: 'Ajustá las preferencias de tu cuenta y aplicación en Gusto.',
}
import styles from './page.module.css'

export default function ConfiguracionPage() {
    return (
        <>
            <Navbar />
            <main className={styles.main}>
                <Settings />
            </main>
        </>
    )
}
