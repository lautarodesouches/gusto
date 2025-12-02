'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './error.module.css'
import { ROUTES } from '@/routes'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const router = useRouter()

    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className={styles.container}>
            <div className={styles.content}>
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

                <div>
                    <h2 className={styles.title}>¡Ups! Algo salió mal</h2>
                    <p className={styles.subtitle}>
                        Tuvimos un problema al procesar tu solicitud.
                        <br />
                        Por favor, intenta nuevamente.
                    </p>
                </div>

                {error.digest && (
                    <p className={styles.errorCode}>
                        Código de error: {error.digest}
                    </p>
                )}

                <div className={styles.actions}>
                    <button
                        onClick={reset}
                        className={`${styles.button} ${styles.primaryButton}`}
                    >
                        Intentar de nuevo
                    </button>
                    <button
                        onClick={() => router.push(ROUTES.HOME)}
                        className={`${styles.button} ${styles.secondaryButton}`}
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        </div>
    )
}
