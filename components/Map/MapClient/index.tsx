'use client'
import { Error, Loading } from '@/components'
import { useUserLocation } from '@/hooks/useUserLocation'
import { ROUTES } from '@/routes'
import { Restaurant } from '@/types'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useState } from 'react'
import MapView from '../MapView'
import { MapProvider } from '../MapProvider'
import { useToast } from '@/context/ToastContext'

export default function MapClient() {
    const toast = useToast()

    const { coords, error, loading } = useUserLocation()

    const router = useRouter()

    const searchParams = useSearchParams()

    const [hoveredMarker, setHoveredMarker] = useState<number | null>(null)

    const [restaurants, setRestaurants] = useState<Restaurant[]>([])

    const [isLoading, setIsLoading] = useState(true)

    const [center, setCenter] = useState({
        lat: coords?.lat,
        lng: coords?.lng,
    })

    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)

    const fetchRestaurants = useCallback(async () => {
        try {
            const query = new URLSearchParams()

            query.append('near.lat', String(center.lat))
            query.append('near.lng', String(center.lng))

            const tipo = searchParams.get('tipo')
            if (tipo) query.append('tipo', tipo)
            const plato = searchParams.get('plato')
            if (plato) query.append('plato', plato)

            const res = await fetch(`/api/restaurants?${query.toString()}`)

            if (res.status === 401) return router.push(ROUTES.LOGIN)

            if (!res.ok) throw 'Error al cargar restaurantes'

            const data = await res.json()

            setRestaurants(data.recomendaciones)
        } catch (err) {
            console.error(err)

            toast.error('Error al cargar restaurantes')

            setRestaurants([])
        } finally {
            setIsLoading(false)
        }
    }, [searchParams, center])

    useEffect(() => {
        fetchRestaurants()
    }, [fetchRestaurants])

    const handleIdle = () => {
        if (!mapInstance) return
        const newCenter = mapInstance.getCenter()
        if (!newCenter) return

        const lat = newCenter.lat()
        const lng = newCenter.lng()

        // Solo actualizamos si cambió realmente
        if (lat !== center.lat || lng !== center.lng) {
            setCenter({ lat, lng })

            // Actualizamos la URL incluyendo pathname actual
            const query = new URLSearchParams(searchParams.toString())
            query.set('near.lat', String(lat))
            query.set('near.lng', String(lng))
            router.replace(`${window.location.pathname}?${query.toString()}`)
        }
    }
    if (error) return <Error message={error} />
    if (loading || isLoading)
        return <Loading message="Obteniendo ubicación y restaurantes..." />

    return (
        <Suspense fallback={<Loading message="Cargando mapa" />}>
            <MapProvider>
                <MapView
                    coords={coords}
                    setMapInstance={setMapInstance}
                    onIdle={handleIdle}
                    restaurants={restaurants}
                    hoveredMarker={hoveredMarker}
                    setHoveredMarker={setHoveredMarker}
                />
            </MapProvider>
        </Suspense>
    )
}
