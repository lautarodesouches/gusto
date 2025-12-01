import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { verifyRecentPayment } from '@/app/actions/payment'
import { useToast } from '@/context/ToastContext'

export function usePaymentVerification() {
    const router = useRouter()
    const toast = useToast()

    useEffect(() => {
        const checkPendingPayment = async () => {
            const hasPendingPayment = localStorage.getItem('pendingPayment')

            if (hasPendingPayment === 'true') {
                try {
                    // Verificar si hay un pago reciente aprobado
                    const result = await verifyRecentPayment()

                    if (result.success && result.data?.aprobado) {

                        // Limpiar localStorage
                        localStorage.removeItem('pendingPayment')
                        localStorage.removeItem('paymentEmail')

                        // Mostrar mensaje de éxito
                        toast.success('¡Pago completado! Tu cuenta ha sido actualizada a Premium. Ahora puedes crear grupos ilimitados.')

                        // Recargar la página para actualizar el estado
                        window.location.reload()
                    }
                } catch (error) {
                    console.error('Error verificando pago:', error)
                }
            }
        }

        // Verificar después de 2 segundos (dar tiempo a que cargue la página)
        const timer = setTimeout(checkPendingPayment, 2000)

        return () => clearTimeout(timer)
    }, [router, toast])
}
