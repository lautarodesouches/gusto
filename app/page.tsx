import Link from 'next/link'
import styles from './page.module.css'
import { ROUTES } from '@/routes'

export default function Home() {
    return (
        <>
            <div className={styles.div}>Hello gusto!</div>
            <Link href={ROUTES.LOGIN}>Login</Link>
            <Link href={ROUTES.REGISTRO}>Registro</Link>
        </>
    )
}
