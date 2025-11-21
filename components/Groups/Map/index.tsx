/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import styles from './styles.module.css'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import Loading from '@/components/Loading'
import { MapProvider } from '@/components/Map/MapProvider'
import MapView from '@/components/Map/MapView'
import ErrorComponent from '@/components/Error'
import { useToast } from '@/context/ToastContext'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useUserLocation } from '@/hooks/useUserLocation'
import { Coordinates, Restaurant } from '@/types'
import { ROUTES } from '@/routes'
import SearchZoneButton from '@/components/Map/SearchZoneButton'

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

function coordinatesChanged(
    prev: Coordinates | null,
    current: Coordinates
): boolean {
    if (!prev) return true
    return prev.lat !== current.lat || prev.lng !== current.lng
}

interface GroupMapProps {
    members: Array<{
        id: string
        checked: boolean
        usuarioUsername: string
        [key: string]: any
    }>
    onRestaurantsChange?: (restaurants: Restaurant[]) => void
}

export default function GroupMap({ members, onRestaurantsChange }: GroupMapProps) {
    const toast = useToast()

    const router = useRouter()
    const searchParams = useSearchParams()
    const { id: grupoId } = useParams()

    const {
        coords,
        error: locationError,
        loading: locationLoading,
    } = useUserLocation()

    const [state, setState] = useState<MapState>(INITIAL_STATE)
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
    const [shouldSearchButton, setShouldSearchButton] = useState(false)
    const [initialLoaded, setInitialLoaded] = useState(false)

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
            if (isFetchingRef.current) return

            isFetchingRef.current = true
            setState(prev => ({ ...prev, isLoading: true }))

            try {
                if (!grupoId) {
                    return
                }

                const query = new URLSearchParams()
                query.append('near.lat', String(center.lat))
                query.append('near.lng', String(center.lng))
                query.append('radiusMeters', searchParams.get('radius') || '1000')
                query.append('top', '10')

                const res = await fetch(`/api/group/${grupoId}/restaurants?${query.toString()}`)

                if (res.status === 401) {
                    router.push(ROUTES.LOGIN)
                    return
                }

                if (!res.ok) {
                    throw new Error('Error al cargar restaurantes del grupo')
                }

                const data = await res.json()

                const newRestaurants = data.recomendaciones || []

                setState(prev => ({
                    ...prev,
                    restaurants: newRestaurants,
                    isLoading: false,
                }))

                // Notificar al componente padre sobre los nuevos restaurantes
                if (onRestaurantsChange) {
                    onRestaurantsChange(newRestaurants)
                }

                setShouldSearchButton(false)
            } catch {
                toast.error('Error al cargar restaurantes del grupo')
                setState(prev => ({
                    ...prev,
                    restaurants: [],
                    isLoading: false,
                }))
            } finally {
                isFetchingRef.current = false
            }
        },
        [grupoId, router, toast, searchParams]
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

        // ⭐ SOLO mostramos botón — NADA MÁS (no buscar automáticamente)
        if (initialLoaded) setShouldSearchButton(true)
    }, [mapInstance, state.center, updateCenter, initialLoaded])

    // Update center when coords are available
    useEffect(() => {
        if (!coords) return
        if (state.center) return

        updateCenter(coords)

        // Cargar restaurantes solo la primera vez
        setTimeout(() => {
            fetchRestaurants(coords)
            setInitialLoaded(true)
        }, 100)
    }, [coords, state.center, updateCenter, fetchRestaurants])

    // Recargar restaurantes cuando cambien los miembros (checked/unchecked)
    // Usamos un string serializado de los estados checked para detectar cambios
    const membersCheckedState = members.map(m => `${m.id}:${m.checked}`).join(',')
    const lastMembersStateRef = useRef<string>('')
    
    useEffect(() => {
        if (!state.center || !initialLoaded) return
        
        // Solo recargar si realmente cambió el estado de los miembros
        if (membersCheckedState !== lastMembersStateRef.current) {
            lastMembersStateRef.current = membersCheckedState
            fetchRestaurants(state.center)
        }
    }, [membersCheckedState, state.center, initialLoaded, fetchRestaurants])

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
                <SearchZoneButton
                    isVisible={shouldSearchButton}
                    onClick={() => fetchRestaurants(state.center!)}
                />

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
