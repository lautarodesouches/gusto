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
    // const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!navigator.geolocation) {
            // Si no hay geolocalización, usar ubicación por defecto
            setCoords(DEFAULT_LOCATION)
            setLoading(false)
            return
        }

        let isMounted = true

        // Timeout extendido para dar más tiempo a obtener la ubicación
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
                if (isMounted) {
                    setCoords({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    })
                    setLoading(false)
                }
            },
            err => {
                clearTimeout(timeoutId)
                if (isMounted) {
                    // Si hay error, usar ubicación por defecto en lugar de mostrar error
                    // console.warn('No se pudo obtener la ubicación:', err.message)
                    setCoords(DEFAULT_LOCATION)
                    setLoading(false)
                }
            },
            {
                enableHighAccuracy: false, // Cambiar a false para que sea más rápido
                timeout: 8000, // Timeout de 8 segundos
                maximumAge: 300000 // Aceptar ubicación cacheada de hasta 5 minutos
            }
        )

        return () => {
            isMounted = false
            clearTimeout(timeoutId)
        }
    }, [])

    return { coords, error: null, loading }
}
