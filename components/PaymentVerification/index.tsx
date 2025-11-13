'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { PaymentSuccess } from '@/components'

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

                            // Mostrar pantalla de éxito
                            setShowSuccess(true)
                            
                            // El componente PaymentSuccess manejará la redirección automáticamente
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
