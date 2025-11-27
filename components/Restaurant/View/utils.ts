import { Restaurant, Review } from '@/types'

export interface ScheduleItem {
    day: string
    hours: string
    cerrado: boolean
}

export interface OpenStatus {
    abierto: boolean
    mensaje: string
    color: string
}

export interface RatingDistribution {
    excelente: number
    bueno: number
    promedio: number
    malo: number
    horrible: number
}

export const parseHorarios = (restaurant: Restaurant): ScheduleItem[] => {
    if (!restaurant.esDeLaApp || !restaurant.horariosJson) {
        return []
    }

    try {
        const horarios = JSON.parse(restaurant.horariosJson)
        if (!Array.isArray(horarios)) return []

        // Orden de días de la semana
        const ordenDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

        return horarios
            .sort((a, b) => {
                const indexA = ordenDias.indexOf(a.dia as string)
                const indexB = ordenDias.indexOf(b.dia as string)
                return indexA - indexB
            })
            .map((horario: Record<string, unknown>) => ({
                day: (horario.dia || '') as string,
                hours: (horario.cerrado as boolean)
                    ? 'Cerrado'
                    : (horario.desde && horario.hasta)
                        ? `De ${horario.desde} a ${horario.hasta}`
                        : 'Horario no disponible',
                cerrado: (horario.cerrado || false) as boolean
            }))
    } catch (error) {
        console.error('Error parseando horarios:', error)
        return []
    }
}

export const getEstadoActual = (restaurant: Restaurant, horarios: ScheduleItem[]): OpenStatus => {
    if (!restaurant.esDeLaApp || horarios.length === 0) {
        return { abierto: false, mensaje: 'Horario no disponible', color: '#888' }
    }

    const ahora = new Date()
    const diaActual = ahora.getDay() // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    const horaActual = ahora.getHours()
    const minutoActual = ahora.getMinutes()
    const horaActualTotal = horaActual * 60 + minutoActual // Convertir a minutos desde medianoche

    // Mapear día de JS (0-6) a días de la semana en español
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const diaActualNombre = diasSemana[diaActual]

    // Buscar el horario del día actual
    const horarioHoy = horarios.find(h => h.day === diaActualNombre)

    if (!horarioHoy) {
        return { abierto: false, mensaje: 'Horario no disponible', color: '#888' }
    }

    if (horarioHoy.cerrado) {
        return { abierto: false, mensaje: 'Cerrado hoy', color: '#ff6b6b' }
    }

    // Parsear las horas de apertura y cierre (formato: "De 12:00 a 22:00")
    const match = horarioHoy.hours.match(/De (\d{1,2}):(\d{2}) a (\d{1,2}):(\d{2})/)
    if (!match) {
        return { abierto: true, mensaje: 'Abierto', color: '#4ade80' }
    }

    const horaApertura = parseInt(match[1], 10)
    const minutoApertura = parseInt(match[2], 10)
    const horaCierre = parseInt(match[3], 10)
    const minutoCierre = parseInt(match[4], 10)

    const horaAperturaTotal = horaApertura * 60 + minutoApertura
    const horaCierreTotal = horaCierre * 60 + minutoCierre

    // Verificar si está dentro del horario de apertura
    if (horaActualTotal >= horaAperturaTotal && horaActualTotal < horaCierreTotal) {
        return {
            abierto: true,
            mensaje: `Abierto hasta las ${match[3]}:${match[4]}`,
            color: '#4ade80'
        }
    } else if (horaActualTotal < horaAperturaTotal) {
        // Aún no ha abierto
        return {
            abierto: false,
            mensaje: `Abre a las ${match[1]}:${match[2]}`,
            color: '#fbbf24'
        }
    } else {
        // Ya cerró
        return { abierto: false, mensaje: 'Cerrado', color: '#ff6b6b' }
    }
}

export const getRatingDistribution = (restaurant: Restaurant, reviews: Review[]): RatingDistribution => {
    const distribution = {
        excelente: 0,
        bueno: 0,
        promedio: 0,
        malo: 0,
        horrible: 0
    }

    // Usar reviews locales o de Google si existen, o el array general
    const reviewsToUse = (restaurant.reviewsLocales && restaurant.reviewsLocales.length > 0)
        ? restaurant.reviewsLocales
        : (restaurant.reviewsGoogle && restaurant.reviewsGoogle.length > 0)
            ? restaurant.reviewsGoogle
            : reviews

    if (!reviewsToUse || reviewsToUse.length === 0) return distribution

    reviewsToUse.forEach(review => {
        const rating = review.rating || review.valoracion || 0
        if (rating >= 4.5) distribution.excelente++
        else if (rating >= 3.5) distribution.bueno++
        else if (rating >= 2.5) distribution.promedio++
        else if (rating >= 1.5) distribution.malo++
        else distribution.horrible++
    })

    return distribution
}

export const getRatingLabel = (rating: number): string => {
    if (rating >= 4.5) return 'Excelente'
    if (rating >= 3.5) return 'Muy Bueno'
    if (rating >= 2.5) return 'Bueno'
    if (rating >= 1.5) return 'Regular'
    return 'Malo'
}

export const getSafeImageUrl = (url: string | null | undefined, fallback: string): string => {
    if (!url) return fallback
    // Si la URL es de Google Places API (que está dando 404), usar fallback directamente
    if (url.includes('places.googleapis.com')) return fallback
    return url
}
