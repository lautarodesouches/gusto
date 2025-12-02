'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import { ROUTES } from '@/routes'
import { verifyRecentPayment } from '@/app/actions/payment'
import { useAuth } from '@/context/AuthContext'

export default function PagoExitoPage() {
    const router = useRouter()
    const { refreshPremiumStatus } = useAuth()
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')

    useEffect(() => {
        const verify = async () => {
            try {
                // Verificar el pago con el backend
                const result = await verifyRecentPayment()

                if (result.success && result.data?.aprobado) {
                    // Actualizar estado premium en contexto
                    await refreshPremiumStatus()

                    // Limpiar localStorage para evitar que PaymentVerification se ejecute
                    localStorage.removeItem('pendingPayment')
                    localStorage.removeItem('paymentEmail')

                    setStatus('success')

                    // Redirigir al mapa después de unos segundos
                    setTimeout(() => {
                        router.replace(ROUTES.MAP)
                    }, 3000)
                } else {
                    // Si falla la verificación (o no hay pago reciente), redirigir igual
                    // para no dejar al usuario atrapado
                    setStatus('error')
                    setTimeout(() => {
                        router.replace(ROUTES.MAP)
                    }, 2000)
                }
            } catch (error) {
                console.error('Error verifying payment:', error)
                setStatus('error')
                setTimeout(() => {
                    router.replace(ROUTES.MAP)
                }, 2000)
            }
        }

        verify()
    }, [router, refreshPremiumStatus])

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {status === 'verifying' && (
                    <>
                        <h1 className={styles.title}>Verificando pago</h1>
                        <p className={styles.subtitle}>Estamos procesando tu compra...</p>
                        <div className={styles.dotsContainer}>
                            <span className={styles.dot}></span>
                            <span className={styles.dot}></span>
                            <span className={styles.dot}></span>
                        </div>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className={styles.iconContainer}>
                            <div className={styles.circle}>
                                <svg className={styles.checkmark} viewBox="0 0 52 52">
                                    <circle className={styles.checkmarkCircle} cx="26" cy="26" r="25" fill="none" />
                                    <path className={styles.checkmarkCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                                </svg>
                            </div>
                        </div>
                        <h1 className={styles.title}>¡Pago Exitoso!</h1>
                        <p className={styles.subtitle}>Ahora eres Premium</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <h1 className={styles.title}>Procesando...</h1>
                        <p className={styles.subtitle}>Te estamos redirigiendo</p>
                    </>
                )}
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