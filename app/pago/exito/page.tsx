'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

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
        router.replace('/mapa?payment=success')
    }, [searchParams, router])

    // Mostrar un loader mientras redirige
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Procesando tu pago exitoso...</p>
            </div>
        </div>
    )
}