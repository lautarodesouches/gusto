'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PremiumBenefits } from '@/components'

export default function PagoExitoPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [verifying, setVerifying] = useState(true)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        const pagoId = searchParams.get('payment_id')
        
        if (pagoId) {
            verifyPayment(pagoId)
        } else {
            setVerifying(false)
        }
    }, [searchParams])

    const verifyPayment = async (pagoId: string) => {
        try {
            const response = await fetch(`/api/payment/verify?pagoId=${pagoId}`)
            const data = await response.json()
            
            if (response.ok && data.aprobado) {
                setSuccess(true)
            }
        } catch (error) {
            console.error('Error verificando pago:', error)
        } finally {
            setVerifying(false)
        }
    }

    const handleContinue = () => {
        router.push('/map')
    }

    if (verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando tu pago...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 text-center">
                {success ? (
                    <>
                        <div className="text-6xl mb-4">🎉</div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            ¡Pago Exitoso!
                        </h1>
                        <p className="text-gray-600 mb-6">
                            ¡Felicitaciones! Ahora eres usuario Premium y puedes disfrutar de todos los beneficios.
                        </p>
                        
                        <div className="mb-6">
                            <PremiumBenefits showPrice={false} />
                        </div>

                        <button
                            onClick={handleContinue}
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                        >
                            Continuar a la App
                        </button>
                    </>
                ) : (
                    <>
                        <div className="text-6xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Verificación Pendiente
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Tu pago está siendo procesado. Te notificaremos cuando se complete.
                        </p>
                        
                        <button
                            onClick={handleContinue}
                            className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Volver a la App
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}