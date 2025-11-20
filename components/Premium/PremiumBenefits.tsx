'use client'

import { useState, useEffect } from 'react'
import { BeneficiosPremium } from '@/types'
import { getPaymentBenefits } from '@/app/actions/payment'

interface PremiumBenefitsProps {
    benefits?: BeneficiosPremium
    showPrice?: boolean
    className?: string
}

export default function PremiumBenefits({ 
    benefits, 
    showPrice = true, 
    className = '' 
}: PremiumBenefitsProps) {
    const [beneficios, setBeneficios] = useState<BeneficiosPremium | null>(benefits || null)
    const [loading, setLoading] = useState(!benefits)

    useEffect(() => {
        if (!benefits) {
            fetchBenefits()
        }
    }, [benefits])

    const fetchBenefits = async () => {
        try {
            setLoading(true)
            const result = await getPaymentBenefits()
            
            if (result.success && result.data) {
                setBeneficios(result.data as BeneficiosPremium)
            }
        } catch (error) {
            console.error('Error al cargar beneficios:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className={`animate-pulse ${className}`}>
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        )
    }

    if (!beneficios) {
        return null
    }

    return (
        <div className={className}>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-lg text-white">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">⭐</span>
                    <h3 className="text-xl font-bold">Plan Premium</h3>
                </div>
                
                <ul className="space-y-3 mb-6">
                    {beneficios.beneficios.map((beneficio, index) => (
                        <li key={index} className="flex items-center gap-2">
                            <span className="text-green-300">✓</span>
                            <span>{beneficio}</span>
                        </li>
                    ))}
                </ul>
                
                {showPrice && (
                    <div className="text-center">
                        <div className="text-3xl font-bold mb-1">
                            ${beneficios.precio.toLocaleString()} {beneficios.moneda}
                        </div>
                        <div className="text-sm opacity-80">Pago único</div>
                    </div>
                )}
            </div>
        </div>
    )
}