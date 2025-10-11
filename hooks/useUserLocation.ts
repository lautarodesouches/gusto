'use client'
import { useEffect, useState } from 'react'

interface Coordinates {
    lat: number
    lng: number
}

export function useUserLocation() {
    const [coords, setCoords] = useState<Coordinates | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('La geolocalización no está disponible en este navegador.')
            setLoading(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            position => {
                setCoords({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                })
                setLoading(false)
            },
            err => {
                setError('No se pudo obtener la ubicación: ' + err.message)
                setLoading(false)
            },
            { enableHighAccuracy: true }
        )
    }, [])

    return { coords, error, loading }
}
