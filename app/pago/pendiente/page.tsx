'use client'

import { useRouter } from 'next/navigation'

export default function PagoPendientePage() {
    const router = useRouter()

    const handleContinue = () => {
        router.push('/map')
    }

    return (
        <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 text-center">
                <div className="text-6xl mb-4">⏳</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Pago Pendiente
                </h1>
                <p className="text-gray-600 mb-6">
                    Tu pago está siendo procesado. Te notificaremos por email cuando se complete y tu cuenta sea actualizada a Premium.
                </p>
                
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded-lg mb-6">
                    <p className="text-sm">
                        <strong>Importante:</strong> Algunos métodos de pago pueden tomar hasta 24 horas en procesarse.
                    </p>
                </div>
                
                <button
                    onClick={handleContinue}
                    className="w-full bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition-colors"
                >
                    Volver a la App
                </button>
            </div>
        </div>
    )
}