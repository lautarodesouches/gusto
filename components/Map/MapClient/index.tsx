'use client'
import { Suspense, useCallback, useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Error as ErrorComponent, Loading } from '@/components'
import { useUserLocation } from '@/hooks/useUserLocation'
import { useToast } from '@/context/ToastContext'
import { ROUTES } from '@/routes'
import { Restaurant, Coordinates } from '@/types'
import MapView from '../MapView'
import { MapProvider } from '../MapProvider'

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

/* ------------------------------ HELPERS ------------------------------ */

function buildRestaurantQuery(center: Coordinates, searchParams: URLSearchParams) {
    const query = new URLSearchParams()

    query.append('near.lat', String(center.lat))
    query.append('near.lng', String(center.lng))

    const tipo = searchParams.get('tipo')
    if (tipo) query.append('tipo', tipo)

    const gustos = searchParams.get('gustos')
    if (gustos) query.append('gustos', gustos)

    const rating = searchParams.get('rating')
    if (rating) query.append('rating', rating)

    const radius = searchParams.get('radius')
    if (radius) query.append('radius', radius)

    return query
}

function coordinatesChanged(prev: Coordinates | null, current: Coordinates): boolean {
    if (!prev) return true
    return prev.lat !== current.lat || prev.lng !== current.lng
}

/* ---------------------------- COMPONENT ----------------------------- */

export default function MapClient({ containerStyle }: { containerStyle: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const toast = useToast()

    const { coords, error: locationError, loading: locationLoading } = useUserLocation()

    const [state, setState] = useState(INITIAL_STATE)
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)

    const isFetchingRef = useRef(false)
    const [shouldSearchButton, setShouldSearchButton] = useState(false)
    const [initialLoaded, setInitialLoaded] = useState(false) // ⭐ para cargar solo una vez

    /* -------------------------- STATE UPDATERS --------------------------- */

    const updateCenter = useCallback((newCenter: Coordinates) => {
        setState(prev => ({
            ...prev,
            center: newCenter,
        }))
    }, [])

    const setHoveredMarker = useCallback((markerId: number | null) => {
        setState(prev => ({ ...prev, hoveredMarker: markerId }))
    }, [])

    /* -------------------------- FETCH RESTAURANTS --------------------------- */

    const fetchRestaurants = useCallback(
        async (center: Coordinates) => {
            if (isFetchingRef.current) return
            isFetchingRef.current = true

            setState(prev => ({ ...prev, isLoading: true }))

            try {
                const query = buildRestaurantQuery(center, searchParams)
                const res = await fetch(`/api/restaurants?${query.toString()}`)

                if (res.status === 401) {
                    router.push(ROUTES.LOGIN)
                    return
                }

                if (!res.ok) throw new Error('Error al cargar restaurantes')

                const data = await res.json()

                setState(prev => ({
                    ...prev,
                    restaurants: data.recomendaciones || [],
                    isLoading: false,
                }))

                setShouldSearchButton(false)
            } catch (err) {
                console.error(err)
                toast.error('Error al cargar restaurantes')

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

    /* --------------------------- MAP MOVEMENT --------------------------- */

    const handleMapIdle = useCallback(() => {
        if (!mapInstance) return

        const mapCenter = mapInstance.getCenter()
        if (!mapCenter) return

        const newCenter = { lat: mapCenter.lat(), lng: mapCenter.lng() }

        if (!coordinatesChanged(state.center, newCenter)) return

        updateCenter(newCenter)

        // ⭐ SOLO mostramos botón — NADA MÁS.
        if (initialLoaded) setShouldSearchButton(true)

    }, [mapInstance, state.center, updateCenter, initialLoaded])

    /* ---------------------- INITIAL LOAD (FETCH) ---------------------- */

    useEffect(() => {
        if (!coords) return
        if (state.center) return

        updateCenter(coords)

        // ⭐ Una vez seteado el center inicial → hacer fetch inmediato
        setTimeout(() => {
            fetchRestaurants(coords)
            setInitialLoaded(true)
        }, 100)
    }, [coords, state.center, updateCenter, fetchRestaurants])

    /* --------------------------- UI / RETURN --------------------------- */

    if (locationError) {
        return <ErrorComponent message={locationError} onRetry={() => window.location.reload()} />
    }

    if (locationLoading || !coords || !state.center) {
        return <Loading message="Obteniendo ubicación..." />
    }

    return (
        <Suspense fallback={<Loading message="Cargando mapa..." />}>
            <MapProvider>

                {/* 🔍 BOTÓN FLOTANTE (SLIDE-DOWN) */}
                {shouldSearchButton && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 20,
                            animation: 'slideDown 0.3s ease',
                        }}
                    >
                        <button
                            onClick={() => fetchRestaurants(state.center!)}
                            style={{
                                background: 'white',
                                padding: '10px 22px',
                                borderRadius: '8px',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                            }}
                        >
                            🔍 Buscar en esta zona
                        </button>
                    </div>
                )}

                <MapView
                    containerStyle={containerStyle}
                    coords={state.center}
                    restaurants={state.restaurants}
                    hoveredMarker={state.hoveredMarker}
                    isLoading={state.isLoading}
                    setMapInstance={setMapInstance}
                    setHoveredMarker={setHoveredMarker}
                    onIdle={handleMapIdle}
                />
            </MapProvider>

            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-15px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
            `}</style>
        </Suspense>
    )
}
