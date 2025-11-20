/**
 * Tipos comunes utilizados en toda la aplicación
 */

export type ApiResponse<T> = {
    success: boolean
    data?: T
    error?: string
}

export type Coordinates = {
    lat: number
    lng: number
}

