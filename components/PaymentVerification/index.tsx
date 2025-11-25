'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { PaymentSuccess } from '@/components'
import { verifyRecentPayment } from '@/app/actions/payment'

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
                    // Esperar 3 segundos para dar tiempo a que MercadoPago procese el pago
                    await new Promise(resolve => setTimeout(resolve, 3000))

                    // VERIFICAR el pago real con el backend (NO forzar upgrade)
                    const verificationResult = await verifyRecentPayment()

                    // Solo actualizar a Premium si el pago fue realmente aprobado
                    if (verificationResult.success && verificationResult.data?.aprobado) {
                        // Actualizar el estado Premium en el contexto
                        await refreshPremiumStatus()

                        // Limpiar localStorage
                        localStorage.removeItem('pendingPayment')
                        localStorage.removeItem('paymentEmail')

                        // Mostrar pantalla de éxito
                        setShowSuccess(true)
                        
                        // El componente PaymentSuccess manejará la redirección automáticamente
                    } else {
                        // Si no hay pago aprobado, limpiar localStorage y no hacer nada
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
    }, [router, token, loading, refreshPremiumStatus])

    return (
        <PaymentSuccess 
            show={showSuccess}
            onComplete={() => {
                router.push('/')
                setTimeout(() => {
                    window.location.reload()
                }, 300)
            }}
        />
    )
}
