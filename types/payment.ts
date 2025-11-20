/**
 * Tipos relacionados con pagos y funcionalidad Premium
 */

export type PlanUsuario = 'Free' | 'Plus'

export type BeneficiosPremium = {
    beneficios: string[]
    precio: number
    moneda: string
}

export type LimiteGruposResponse = {
    mensaje: string
    tipoPlan: string
    limiteActual: number
    gruposActuales: number
    beneficiosPremium: BeneficiosPremium
    urlPago: string
}

export type CrearPagoRequest = {
    email: string
    nombreCompleto: string
}

export type CrearPagoResponse = {
    id: string
    initPoint: string
    sandboxInitPoint: string
    status: string
}

export type PagoError = {
    message: string
    details?: string
}

