'use server'

import { API_URL } from '@/constants'
import { getAuthHeaders } from './common'

export interface PaymentBenefits {
    beneficios: string[]
}

export interface PaymentVerification {
    aprobado: boolean
    message?: string
}

export interface PremiumStatus {
    isPremium: boolean
    error?: string
}

/**
 * Obtiene los beneficios del plan premium
 */
export async function getPaymentBenefits(): Promise<{ success: boolean; data?: PaymentBenefits; error?: string }> {
    try {
        const res = await fetch(`${API_URL}/api/Pago/beneficios`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            return {
                success: false,
                error: errorData.message || 'Error al obtener beneficios',
            }
        }

        const data = await res.json()
        return { success: true, data }
    } catch (error) {
        console.error('Error getting payment benefits:', error)
        return {
            success: false,
            error: 'Error al obtener beneficios',
        }
    }
}

/**
 * Verifica si hay un pago reciente aprobado para el usuario
 */
export async function verifyRecentPayment(): Promise<{ success: boolean; data?: PaymentVerification; error?: string }> {
    try {
        const headers = await getAuthHeaders()
        const res = await fetch(`${API_URL}/api/Pago/verificar-reciente`, {
            method: 'GET',
            headers,
            cache: 'no-store',
        })

        if (!res.ok) {
            return {
                success: true,
                data: { aprobado: false },
            }
        }

        const data = await res.json()
        return { success: true, data }
    } catch (error) {
        console.error('Error verifying recent payment:', error)
        return {
            success: true,
            data: { aprobado: false },
        }
    }
}

/**
 * Verifica el estado de un pago específico
 */
export async function verifyPayment(pagoId: string): Promise<{ success: boolean; data?: PaymentVerification; error?: string }> {
    try {
        const headers = await getAuthHeaders()
        const res = await fetch(`${API_URL}/api/Pago/verificar/${pagoId}`, {
            method: 'GET',
            headers,
            cache: 'no-store',
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            return {
                success: false,
                error: errorData.message || 'Error al verificar pago',
            }
        }

        const data = await res.json()
        return { success: true, data }
    } catch (error) {
        console.error('Error verifying payment:', error)
        return {
            success: false,
            error: 'Error al verificar pago',
        }
    }
}

/**
 * Verifica el estado premium del usuario
 */
export async function verifyPremiumStatus(): Promise<{ success: boolean; data?: PremiumStatus; error?: string }> {
    try {
        const headers = await getAuthHeaders()
        const res = await fetch(`${API_URL}/api/Pago/verificar-estado-premium`, {
            method: 'GET',
            headers,
            cache: 'no-store',
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            return {
                success: true,
                data: {
                    isPremium: false,
                    error: errorData.message || 'Error al verificar estado',
                },
            }
        }

        const data = await res.json()
        return { success: true, data }
    } catch (error) {
        console.error('Error verifying premium status:', error)
        return {
            success: true,
            data: {
                isPremium: false,
                error: 'Error interno del servidor',
            },
        }
    }
}

/**
 * Fuerza la actualización a Premium (solo desarrollo)
 */
export async function upgradeToPremium(): Promise<{ success: boolean; data?: PremiumStatus; error?: string }> {
    try {
        const headers = await getAuthHeaders()
        const res = await fetch(`${API_URL}/api/Pago/forzar-premium-dev`, {
            method: 'POST',
            headers,
            cache: 'no-store',
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            return {
                success: false,
                error: errorData.message || 'Error al actualizar',
            }
        }

        const data = await res.json()
        return { success: true, data }
    } catch (error) {
        console.error('Error upgrading to premium:', error)
        return {
            success: false,
            error: 'Error interno del servidor',
        }
    }
}

/**
 * Crea una preferencia de pago con MercadoPago
 */
export async function createPayment(data: { email: string; nombreCompleto: string }): Promise<{ success: boolean; data?: { initPoint: string }; error?: string }> {
    try {
        const res = await fetch(`${API_URL}/api/Pago/crear-test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                usuarioId: 'test-user',
                email: data.email,
                nombreCompleto: data.nombreCompleto,
            }),
        })

        const responseData = await res.json()

        if (!res.ok) {
            return {
                success: false,
                error: responseData.message || 'Error al crear pago',
            }
        }

        // Para el endpoint de prueba, la respuesta está en data.data
        const initPoint = responseData.success ? responseData.data : responseData
        return { success: true, data: initPoint }
    } catch (error) {
        console.error('Error creating payment:', error)
        return {
            success: false,
            error: 'Error interno del servidor',
        }
    }
}

