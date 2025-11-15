'use client'
import styles from './modal.module.css'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/routes'

export function IncompleteRegistrationModal({ paso }: { paso: number }) {
    const router = useRouter()

    const handleRedirect = () => {
        router.push(`${ROUTES.STEPS}/${paso}`)
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2>Completa tu registro 🍽️</h2>
                <p>
                    Para usar GustosApp necesitas completar tus preferencias.
                </p>

                <button onClick={handleRedirect} className={styles.button}>
                    Completar ahora
                </button>
            </div>
        </div>
    )
}
