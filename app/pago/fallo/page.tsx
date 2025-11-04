'use client'

import { useRouter } from 'next/navigation'

export default function PagoFalloPage() {
    const router = useRouter()

    const handleRetry = () => {
        router.push('/map')
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 text-center">
                <div className="text-6xl mb-4">❌</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Pago Cancelado
                </h1>
                <p className="text-gray-600 mb-6">
                    Tu pago no fue procesado. Puedes intentarlo nuevamente cuando gustes.
                </p>
                
                <div className="space-y-3">
                    <button
                        onClick={handleRetry}
                        className="w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition-colors"
                    >
                        Volver a la App
                    </button>
                    
                    <p className="text-sm text-gray-500">
                        Si tienes problemas, contáctanos en soporte@gustosapp.com
                    </p>
                </div>
            </div>
        </div>
    )
}