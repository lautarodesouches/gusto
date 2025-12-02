'use client'

import { ROUTES } from '@/routes'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function PagoPendientePage() {
    const router = useRouter()

    const handleContinue = () => {
        router.push(ROUTES.MAP)
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* Ícono de reloj animado */}
                <div className={styles.iconContainer}>
                    <div className={styles.circle}>
                        <svg className={styles.clock} viewBox="0 0 52 52">
                            <circle className={styles.clockCircle} cx="26" cy="26" r="23" />
                            <line className={`${styles.clockHand} ${styles.hourHand}`} x1="26" y1="26" x2="26" y2="14" />
                            <line className={`${styles.clockHand} ${styles.minuteHand}`} x1="26" y1="26" x2="34" y2="26" />
                        </svg>
                    </div>
                </div>

                {/* Textos */}
                <h1 className={styles.title}>
                    Pago Pendiente
                </h1>
                <p className={styles.subtitle}>
                    Tu pago está siendo procesado. Te notificaremos por email cuando se complete y tu cuenta sea actualizada a Premium.
                </p>

                {/* Caja de información */}
                <div className={styles.infoBox}>
                    <p className={styles.infoText}>
                        <strong>Importante:</strong> Algunos métodos de pago pueden tomar hasta 24 horas en procesarse.
                    </p>
                </div>

                {/* Botón */}
                <div className={styles.buttonContainer}>
                    <button
                        onClick={handleContinue}
                        className={styles.button}
                    >
                        Volver a la App
                    </button>
                </div>
            </div>
        </div>
    )
}