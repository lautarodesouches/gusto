'use client'
import styles from './styles.module.css'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function PaymentVerification() {
    const router = useRouter()
    const { token, loading, refreshPremiumStatus } = useAuth()
    const [showSuccess, setShowSuccess] = useState(false)

    useEffect(() => {
        // No hacer nada si aún está cargando la autenticación
        if (loading) return

        const checkPayment = async () => {
            const pendingPayment = localStorage.getItem('pendingPayment')
            const paymentEmail = localStorage.getItem('paymentEmail')

            // Verificar que hay un pago pendiente y el usuario está autenticado
            if (pendingPayment === 'true' && paymentEmail && token) {
                try {
                    console.log('🔍 Verificando estado del pago...')
                    console.log('📧 Email de pago:', paymentEmail)
                    console.log('🔑 Token disponible:', !!token)

                    // Esperar 3 segundos para dar tiempo a procesar
                    await new Promise(resolve => setTimeout(resolve, 3000))

                    // Forzar actualización a Premium (solo para desarrollo)
                    const upgradeResponse = await fetch(
                        '/api/payment/upgrade',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    )

                    console.log('📡 Response status:', upgradeResponse.status)

                    if (upgradeResponse.ok) {
                        const upgradeData = await upgradeResponse.json()
                        console.log('📦 Response data:', upgradeData)

                        if (upgradeData.isPremium || upgradeData.success) {
                            console.log('✅ Usuario actualizado a Premium')

                            // Actualizar el estado Premium en el contexto
                            await refreshPremiumStatus()

                            // Limpiar localStorage
                            localStorage.removeItem('pendingPayment')
                            localStorage.removeItem('paymentEmail')

                            // Mostrar notificación
                            setShowSuccess(true)

                            // Redirigir al home después de 2.5 segundos
                            setTimeout(() => {
                                router.push('/')
                                setTimeout(() => {
                                    window.location.reload()
                                }, 300)
                            }, 2500)
                        } else {
                            console.log('⏳ No se pudo actualizar a Premium')
                            localStorage.removeItem('pendingPayment')
                            localStorage.removeItem('paymentEmail')
                        }
                    } else {
                        const errorData = await upgradeResponse
                            .json()
                            .catch(() => null)
                        console.error(
                            '❌ Error al actualizar:',
                            upgradeResponse.status
                        )
                        console.error('❌ Error data:', errorData)
                        localStorage.removeItem('pendingPayment')
                        localStorage.removeItem('paymentEmail')
                    }
                } catch (error) {
                    console.error(
                        '❌ Error verificando el estado del pago:',
                        error
                    )
                    // Limpiar localStorage en caso de error
                    localStorage.removeItem('pendingPayment')
                    localStorage.removeItem('paymentEmail')
                }
            }
        }

        checkPayment()
    }, [router, token, loading])

    if (!showSuccess) return null

    return (
        <div className={styles.modal}>
            <div className={styles.modal__card}>
                <div className={styles.modal__content}>
                    {/* Icono animado */}
                    <div className={styles.modal__icon}>
                        <svg
                            className={styles.modal__check}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>

                    {/* Mensaje */}
                    <div>
                        <h3 className={styles.modal__title}>
                            ¡Pago Exitoso! 🎉
                        </h3>
                        <p className={styles.modal__description}>
                            Ahora tienes acceso{' '}
                            <span className={styles.modal__premium}>
                                Premium
                            </span>
                        </p>
                        <p className={styles.modal__subtitle}>
                            Puedes crear grupos ilimitados
                        </p>
                    </div>

                    {/* Barra de progreso */}
                    <div className={styles.modal__progressbar}>
                        <div className={styles.modal__progress}></div>
                    </div>

                    <p className={styles.modal__redirect}>Redirigiendo...</p>
                </div>
            </div>
        </div>
    )
}
