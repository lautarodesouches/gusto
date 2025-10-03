import styles from './page.module.css'
import Link from 'next/link'
import { ROUTES } from '@/routes'

export default function Home() {
    return (
        <main className={styles.main}>
            <Link href={ROUTES.LOGIN}>LOGIN</Link>
            <Link href={ROUTES.REGISTRO}>REGISTER</Link>
            <Link href={ROUTES.STEPS}>STEPS</Link>
            <Link href={ROUTES.MAP}>MAP</Link>
        </main>
    )
}
