'use client'
import { Coordinates } from '@/types'
import { useEffect, useState } from 'react'

// Ubicación por defecto (Buenos Aires, Argentina)
const DEFAULT_LOCATION: Coordinates = {
    lat: -34.6728048,
    lng: -58.5650301,
}

export function useUserLocation() {
    const [coords, setCoords] = useState<Coordinates | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!navigator.geolocation) {
            // Si no hay geolocalización, usar ubicación por defecto
            setCoords(DEFAULT_LOCATION)
            setLoading(false)
            return
        }

        // Timeout para evitar que se quede cargando indefinidamente
        const timeoutId = setTimeout(() => {
            if (loading) {
                // Si después de 60 segundos no se obtuvo la ubicación, usar la por defecto
                setCoords(DEFAULT_LOCATION)
                setLoading(false)
            }
        }, 60000)

        navigator.geolocation.getCurrentPosition(
            position => {
                clearTimeout(timeoutId)
                setCoords({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                })
                setLoading(false)
            },
            err => {
                clearTimeout(timeoutId)
                // Si hay error, usar ubicación por defecto en lugar de mostrar error
                console.warn('No se pudo obtener la ubicación:', err.message)
                setCoords(DEFAULT_LOCATION)
                setLoading(false)
            },
            {
                enableHighAccuracy: false, // Cambiar a false para que sea más rápido
                timeout: 8000, // Timeout de 8 segundos
                maximumAge: 300000 // Aceptar ubicación cacheada de hasta 5 minutos
            }
        )

        return () => {
            clearTimeout(timeoutId)
        }
    }, [])

    return { coords, error, loading }
}
