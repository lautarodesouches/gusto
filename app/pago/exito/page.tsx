'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import styles from './page.module.css'
import { ROUTES } from '@/routes'

export default function PagoExitoPage() {
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        // Redirigir inmediatamente al mapa con parámetro de pago exitoso
        const pagoId = searchParams.get('payment_id')
        const collectionStatus = searchParams.get('collection_status')

        console.log('🎉 [PagoExito] Redirigiendo al mapa con pago exitoso')
        console.log('Payment ID:', pagoId)
        console.log('Collection Status:', collectionStatus)

        // Redirigir al mapa con parámetro de pago exitoso
        router.replace(`${ROUTES.MAP}?payment=success`)
    }, [searchParams, router])

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* Ícono de verificación animado */}
                <div className={styles.iconContainer}>
                    <div className={styles.circle}>
                        <svg className={styles.checkmark} viewBox="0 0 52 52">
                            <circle className={styles.checkmarkCircle} cx="26" cy="26" r="25" fill="none" />
                            <path className={styles.checkmarkCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                        </svg>
                    </div>
                </div>

                {/* Textos */}
                <h1 className={styles.title}>
                    Verificando pago
                </h1>
                <p className={styles.subtitle}>
                    Estamos procesando tu compra
                </p>

                {/* Puntos de carga animados */}
                <div className={styles.dotsContainer}>
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
                </div>
            </div>

            {/* Barra de progreso */}
            <div className={styles.progressContainer}>
                <p className={styles.progressText}>Redirigiendo...</p>
                <div className={styles.progressBar}>
                    <div className={styles.progressFill}></div>
                </div>
            </div>
        </div>
    )
}