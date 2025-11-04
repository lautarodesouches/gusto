'use client'
import styles from './styles.module.css'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import Loading from '@/components/Loading'
import { MapProvider } from '@/components/Map/MapProvider'
import MapView from '@/components/Map/MapView'
import ErrorComponent from '@/components/Error'
import { useToast } from '@/context/ToastContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUserLocation } from '@/hooks/useUserLocation'
import { Coordinates, Restaurant } from '@/types'
import { ROUTES } from '@/routes'

interface MapState {
    restaurants: Restaurant[]
    hoveredMarker: number | null
    center: Coordinates | null
    isLoading: boolean
}

const INITIAL_STATE: MapState = {
    restaurants: [],
    hoveredMarker: null,
    center: null,
    isLoading: true,
}

function buildRestaurantQuery(center: Coordinates): URLSearchParams {
    const query = new URLSearchParams()

    query.append('near.lat', String(center.lat))
    query.append('near.lng', String(center.lng))

    return query
}

function coordinatesChanged(
    prev: Coordinates | null,
    current: Coordinates
): boolean {
    if (!prev) return true
    return prev.lat !== current.lat || prev.lng !== current.lng
}

export default function GroupMap() {
    const toast = useToast()
    const router = useRouter()
    const searchParams = useSearchParams()

    const {
        coords,
        error: locationError,
        loading: locationLoading,
    } = useUserLocation()

    const [state, setState] = useState<MapState>(INITIAL_STATE)
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)

    // Ref prevent duplicate fetch
    const isFetchingRef = useRef(false)

    const updateCenter = useCallback((newCenter: Coordinates) => {
        setState(prev => ({
            ...prev,
            center: newCenter,
        }))
    }, [])

    const setHoveredMarker = useCallback((markerId: number | null) => {
        setState(prev => ({
            ...prev,
            hoveredMarker: markerId,
        }))
    }, [])

    const fetchRestaurants = useCallback(
        async (center: Coordinates) => {
            // Evitar fetches duplicados
            if (isFetchingRef.current) return

            isFetchingRef.current = true
            setState(prev => ({ ...prev, isLoading: true }))

            try {
                const query = buildRestaurantQuery(center)
                const res = await fetch(`/api/restaurants?${query.toString()}`)

                if (res.status === 401) {
                    router.push(ROUTES.LOGIN)
                    return
                }

                if (!res.ok) {
                    throw new Error('Error al cargar restaurantes')
                }

                const data = await res.json()

                setState(prev => ({
                    ...prev,
                    restaurants: data.recomendaciones || [],
                    isLoading: false,
                }))
            } catch (err) {
                console.error('Error fetching restaurants:', err)

                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : 'Error al cargar restaurantes'

                toast.error(errorMessage)

                setState(prev => ({
                    ...prev,
                    restaurants: [],
                    isLoading: false,
                }))
            } finally {
                isFetchingRef.current = false
            }
        },
        [searchParams, router, toast]
    )

    const handleMapIdle = useCallback(() => {
        if (!mapInstance) return

        const mapCenter = mapInstance.getCenter()
        if (!mapCenter) return

        const newCenter: Coordinates = {
            lat: mapCenter.lat(),
            lng: mapCenter.lng(),
        }

        if (!coordinatesChanged(state.center, newCenter)) return

        updateCenter(newCenter)

        const query = new URLSearchParams(searchParams.toString())
        query.set('near.lat', String(newCenter.lat))
        query.set('near.lng', String(newCenter.lng))
    }, [mapInstance, state.center, searchParams, router, updateCenter])

    // Update center when coords are available
    useEffect(() => {
        if (!coords) return
        if (state.center) return

        updateCenter(coords)
    }, [coords, state.center, updateCenter])

    // Fetch restaurants when center or filters change
    useEffect(() => {
        if (!state.center) return

        fetchRestaurants(state.center)
    }, [state.center, searchParams, fetchRestaurants])

    if (locationError) {
        return (
            <ErrorComponent
                message={locationError}
                onRetry={() => window.location.reload()}
            />
        )
    }

    if (locationLoading || !coords || !state.center) {
        return (
            <div className={styles.loading}>
                <Loading message="Obteniendo ubicación..." />
            </div>
        )
    }

    return (
        <Suspense fallback={<Loading message="Cargando mapa..." />}>
            <MapProvider>
                <MapView
                    containerStyle={styles.map}
                    coords={state.center}
                    restaurants={state.restaurants}
                    hoveredMarker={state.hoveredMarker}
                    isLoading={state.isLoading}
                    setMapInstance={setMapInstance}
                    setHoveredMarker={setHoveredMarker}
                    onIdle={handleMapIdle}
                />
            </MapProvider>
        </Suspense>
    )
}
