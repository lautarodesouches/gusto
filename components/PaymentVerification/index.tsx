'use client'

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
                    const upgradeResponse = await fetch('/api/payment/upgrade', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    })

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
                        const errorData = await upgradeResponse.json().catch(() => null)
                        console.error('❌ Error al actualizar:', upgradeResponse.status)
                        console.error('❌ Error data:', errorData)
                        localStorage.removeItem('pendingPayment')
                        localStorage.removeItem('paymentEmail')
                    }
                } catch (error) {
                    console.error('❌ Error verificando el estado del pago:', error)
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-in zoom-in slide-in-from-bottom-4 duration-500 pointer-events-auto">
                <div className="text-center space-y-4">
                    {/* Icono animado */}
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full animate-bounce">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    {/* Mensaje */}
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            ¡Pago Exitoso! 🎉
                        </h3>
                        <p className="text-gray-600">
                            Ahora tienes acceso <span className="font-bold text-purple-600">Premium</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Puedes crear grupos ilimitados
                        </p>
                    </div>

                    {/* Barra de progreso */}
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 animate-progress" 
                             style={{ animation: 'progress 2.5s linear forwards' }}>
                        </div>
                    </div>

                    <p className="text-xs text-gray-400">
                        Redirigiendo...
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes progress {
                    from {
                        width: 0%;
                    }
                    to {
                        width: 100%;
                    }
                }
                .animate-progress {
                    animation: progress 2.5s linear forwards;
                }
            `}</style>
        </div>
    )
}
