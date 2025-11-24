import Navbar from '@/components/Navbar'
import Settings from '@/components/Settings'
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
