'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import './PremiumModal.css'

interface UpgradePremiumModalProps {
    isOpen: boolean
    onClose: () => void
    trigger?: 'group_limit' | 'general'
    limitInfo?: {
        tipoPlan: string
        limiteActual: number
        gruposActuales: number
        beneficiosPremium?: unknown
    }
}

export default function UpgradePremiumModal({
    isOpen,
    onClose,
    trigger = 'general',
    limitInfo,
}: UpgradePremiumModalProps) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Cerrar modal con ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEsc)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleEsc)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    const handleUpgrade = async () => {
        if (!user?.email) {
            setError('No se encontró información del usuario')
            return
        }

        try {
            setLoading(true)
            setError('')

            const nombreCompleto =
                user.displayName || `${user.email.split('@')[0]}`

            const response = await fetch('/api/payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: user.email,
                    nombreCompleto,
                }),
            })

            const data = await response.json()

            if (response.ok && data.initPoint) {
                localStorage.setItem('pendingPayment', 'true')
                localStorage.setItem('paymentEmail', user.email)

                window.location.href = data.initPoint
            } else {
                setError(
                    data.message || data.error || 'Error al procesar el pago'
                )
            }
        } catch (error) {
            console.error('Error al crear pago:', error)
            setError('Error de conexión. Intenta nuevamente.')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            {/* Backdrop con blur */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>

            {/* Modal */}
            <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-300">
                {/* Header con gradiente y patrón */}
                <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 p-8 rounded-t-3xl text-white overflow-hidden">
                    {/* Patrón de fondo */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-400 rounded-full blur-3xl"></div>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-all"
                    >
                        ×
                    </button>

                    <div className="relative z-10 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                            <span className="text-4xl">⭐</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">
                            {trigger === 'group_limit'
                                ? '¡Alcanzaste el Límite!'
                                : 'Hazte Premium'}
                        </h2>
                        <p className="text-purple-100 text-lg">
                            {trigger === 'group_limit'
                                ? `Tienes ${
                                      limitInfo?.gruposActuales || 3
                                  } de ${
                                      limitInfo?.limiteActual || 3
                                  } grupos disponibles`
                                : 'Desbloquea todas las funciones'}
                        </p>
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-8">
                    {/* Beneficios */}
                    <div className="space-y-3 mb-8">
                        {[
                            {
                                icon: '🚀',
                                title: 'Grupos Ilimitados',
                                desc: 'Crea todos los grupos que quieras',
                            },
                            {
                                icon: '🎯',
                                title: 'IA Avanzada',
                                desc: 'Recomendaciones personalizadas mejoradas',
                            },
                            {
                                icon: '📊',
                                title: 'Estadísticas Pro',
                                desc: 'Análisis detallado de tu grupo',
                            },
                            {
                                icon: '💎',
                                title: 'Sin Anuncios',
                                desc: 'Experiencia premium sin interrupciones',
                            },
                        ].map((benefit, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100/50 hover:border-purple-200 transition-all"
                            >
                                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
                                    {benefit.icon}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800">
                                        {benefit.title}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        {benefit.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Precio */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 mb-6 text-center">
                        <div className="text-sm text-green-700 font-medium mb-2">
                            Oferta Especial
                        </div>
                        <div className="text-4xl font-bold text-green-700 mb-1">
                            $50 <span className="text-2xl">ARS</span>
                        </div>
                        <div className="text-green-600 font-medium">
                            Pago único · Acceso de por vida
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-start gap-3 animate-in slide-in-from-top">
                            <span className="text-xl">⚠️</span>
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {/* Botón de acción */}
                    <button
                        onClick={handleUpgrade}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    >
                        {/* Efecto de brillo */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                        <span className="relative flex items-center justify-center gap-3">
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <span className="text-xl">💳</span>
                                    Continuar con MercadoPago
                                </>
                            )}
                        </span>
                    </button>

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t border-gray-100 space-y-2 text-center">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Pago 100% seguro con MercadoPago
                        </div>
                        <p className="text-xs text-gray-400">
                            Regresa a esta página después de completar tu pago
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
