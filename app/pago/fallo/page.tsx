'use client'

import { ROUTES } from '@/routes'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function PagoFalloPage() {
    const router = useRouter()

    const handleRetry = () => {
        router.push(ROUTES.MAP)
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* Ícono de error animado */}
                <div className={styles.iconContainer}>
                    <div className={styles.circle}>
                        <svg className={styles.cross} viewBox="0 0 52 52">
                            <path
                                className={styles.crossLine}
                                fill="none"
                                d="M16 16 36 36"
                            />
                            <path
                                className={`${styles.crossLine} ${styles.crossLineDelay}`}
                                fill="none"
                                d="M36 16 16 36"
                            />
                        </svg>
                    </div>
                </div>

                {/* Textos */}
                <h1 className={styles.title}>
                    Pago Cancelado
                </h1>
                <p className={styles.subtitle}>
                    Tu pago no pudo ser procesado. No te preocupes, no se ha realizado ningún cargo a tu cuenta.
                </p>

                {/* Botón */}
                <div className={styles.buttonContainer}>
                    <button
                        onClick={handleRetry}
                        className={styles.button}
                    >
                        Volver a intentar
                    </button>
                </div>

                <p className={styles.contactText}>
                    Si el problema persiste, contáctanos en soporte@gustosapp.com
                </p>
            </div>
        </div>
    )
}