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
import SearchZoneButton from '../SearchZoneButton'
import MyLocationButton from '../MyLocationButton'
import { searchRestaurants } from '@/app/actions/restaurants'
import { normalizeResponse, isValidRestaurant, mapToRestaurant } from './utils'

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

function _buildRestaurantQuery(center: Coordinates, searchParams: URLSearchParams) {
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

    // Leer 'amigo' de la URL y enviarlo como 'amigoUsername' al backend
    const amigo = searchParams.get('amigo')
    if (amigo) query.append('amigoUsername', amigo)

    return query
}

function coordinatesChanged(prev: Coordinates | null, current: Coordinates): boolean {
    if (!prev) return true
    return prev.lat !== current.lat || prev.lng !== current.lng
}

export default function MapClient({ containerStyle }: { containerStyle: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const toast = useToast()

    const { coords, error: locationError, loading: locationLoading } = useUserLocation()

    const [state, setState] = useState(INITIAL_STATE)
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null)

    const isFetchingRef = useRef(false)
    const [shouldSearchButton, setShouldSearchButton] = useState(false)
    const [initialLoaded, setInitialLoaded] = useState(false) // ⭐ para cargar solo una vez
    const lastAmigoUsernameRef = useRef<string | null>(null)
    const lastGustosRef = useRef<string | null>(null)
    const lastRatingRef = useRef<string | null>(null)
    const lastRadiusRef = useRef<string | null>(null)

    const updateCenter = useCallback((newCenter: Coordinates) => {
        setState(prev => ({
            ...prev,
            center: newCenter,
        }))
    }, [])

    const setHoveredMarker = useCallback((markerId: number | null) => {
        setState(prev => ({ ...prev, hoveredMarker: markerId }))
    }, [])

    const fetchRestaurants = useCallback(
        async (center: Coordinates, onComplete?: () => void) => {
            if (isFetchingRef.current) return
            isFetchingRef.current = true

            setState(prev => ({ ...prev, isLoading: true }))

            try {
                const params = {
                    nearLat: String(center.lat),
                    nearLng: String(center.lng),
                    gustos: searchParams.get('gustos') || undefined,
                    rating: searchParams.get('rating') || undefined,
                    radius: searchParams.get('radius') || undefined,
                    amigoUsername: searchParams.get('amigo') || undefined,
                }

                const result = await searchRestaurants(params)

                if (!result.success) {
                    if (result.error?.includes('No autorizado') || result.error?.includes('401')) {
                        router.push(ROUTES.LOGIN)
                        return
                    }
                    throw new Error(result.error || 'Error al cargar restaurantes')
                }

                // Obtener los restaurantes de result.data
                const data = result.data
                if (!data) {
                    setState(prev => ({
                        ...prev,
                        restaurants: [],
                        isLoading: false,
                    }))
                    return
                }

                // Normalizar la respuesta (puede venir como array o como objeto con recomendaciones)
                const restaurants = normalizeResponse(data)

                // Filtrar restaurantes con coordenadas válidas y mapear
                const mappedRestaurants = restaurants
                    .filter(isValidRestaurant)
                    .map(mapToRestaurant)
                    .filter((r): r is Restaurant => r !== null)

                setState(prev => ({
                    ...prev,
                    restaurants: mappedRestaurants,
                    isLoading: false,
                }))

                if (mappedRestaurants.length === 0) {
                    toast.info('No encontramos restaurantes en la zona con tus filtros')
                }

                setShouldSearchButton(false)

                // Ejecutar callback si existe
                if (onComplete) {
                    onComplete()
                }
            } catch {
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

    const handleGoToMyLocation = useCallback(() => {
        if (!mapInstance) return

        if (!navigator.geolocation) {
            toast.error('Tu navegador no soporta geolocalización')
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                const newCoords = { lat: latitude, lng: longitude }
                const targetPosition = new google.maps.LatLng(latitude, longitude)

                mapInstance.panTo(targetPosition)
                mapInstance.setZoom(16)
                updateCenter(newCoords)

                // Buscar restaurantes en la nueva ubicación
                fetchRestaurants(newCoords)
            },
            (error) => {
                console.warn('Error getting location:', error)
                toast.error('No se pudo obtener tu ubicación actual. Asegúrate de permitir el acceso.')
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        )
    }, [mapInstance, updateCenter, fetchRestaurants, toast])

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

    useEffect(() => {
        if (!coords) return
        if (state.center) return

        updateCenter(coords)

        setTimeout(() => {
            fetchRestaurants(coords)
            setInitialLoaded(true)
        }, 100)
    }, [coords, state.center, updateCenter, fetchRestaurants])

    // Recargar restaurantes cuando cambie el amigo (parámetro de URL)
    useEffect(() => {
        if (!state.center || !initialLoaded) return

        const currentAmigo = searchParams.get('amigo')
        if (currentAmigo !== lastAmigoUsernameRef.current) {
            lastAmigoUsernameRef.current = currentAmigo
            fetchRestaurants(state.center)
        }
    }, [searchParams, state.center, initialLoaded, fetchRestaurants])

    // Recargar restaurantes cuando cambien los filtros (gustos o rating)
    useEffect(() => {
        if (!state.center || !initialLoaded) return

        const currentGustos = searchParams.get('gustos')
        const currentRating = searchParams.get('rating')

        const gustosChanged = currentGustos !== lastGustosRef.current
        const ratingChanged = currentRating !== lastRatingRef.current

        if (gustosChanged || ratingChanged) {
            lastGustosRef.current = currentGustos
            lastRatingRef.current = currentRating
            fetchRestaurants(state.center)
        }
    }, [searchParams, state.center, initialLoaded, fetchRestaurants])

    // Recargar restaurantes cuando cambie el radio de búsqueda
    useEffect(() => {
        if (!state.center || !initialLoaded) return

        const currentRadius = searchParams.get('radius')
        if (currentRadius !== lastRadiusRef.current) {
            lastRadiusRef.current = currentRadius
            fetchRestaurants(state.center)
        }
    }, [searchParams, state.center, initialLoaded, fetchRestaurants])

    // Escuchar evento para mover el mapa cuando se selecciona un restaurante desde la búsqueda
    useEffect(() => {
        const handleMapPanTo = (event: CustomEvent<{ lat: number; lng: number; restaurantId: string }>) => {
            if (!mapInstance) return

            const { lat, lng, restaurantId } = event.detail

            // Validar coordenadas
            if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                console.warn('Coordenadas inválidas:', { lat, lng })
                return
            }

            const targetPosition = new google.maps.LatLng(lat, lng)

            // Mover el mapa con animación
            mapInstance.panTo(targetPosition)

            // Ajustar zoom para una mejor vista
            mapInstance.setZoom(16)

            // Actualizar el centro del estado
            updateCenter({ lat, lng })

            // Guardar el ID del restaurante seleccionado para resaltarlo
            setSelectedRestaurantId(restaurantId)

            // Buscar restaurantes en la nueva ubicación y luego abrir el InfoWindow del restaurante seleccionado
            fetchRestaurants({ lat, lng }, () => {
                // Callback que se ejecuta después de cargar los restaurantes
                setTimeout(() => {
                    setState(prev => {
                        const restaurantIndex = prev.restaurants.findIndex(r => r.id === restaurantId)
                        if (restaurantIndex !== -1) {
                            return {
                                ...prev,
                                hoveredMarker: restaurantIndex
                            }
                        }
                        return prev
                    })
                }, 300) // Pequeño delay para asegurar que el estado se haya actualizado
            })
        }

        window.addEventListener('mapPanTo', handleMapPanTo as EventListener)

        return () => {
            window.removeEventListener('mapPanTo', handleMapPanTo as EventListener)
        }
    }, [mapInstance, updateCenter, fetchRestaurants])

    if (locationError) {
        return <ErrorComponent message={locationError} onRetry={() => window.location.reload()} />
    }

    if (locationLoading || !coords || !state.center) {
        return <Loading message="Obteniendo ubicación..." />
    }

    return (
        <Suspense fallback={<Loading message="Cargando mapa..." />}>
            <MapProvider>
                <SearchZoneButton
                    isVisible={shouldSearchButton}
                    onClick={() => fetchRestaurants(state.center!)}
                />

                <MyLocationButton onClick={handleGoToMyLocation} />

                <MapView
                    containerStyle={containerStyle}
                    coords={state.center}
                    restaurants={state.restaurants}
                    hoveredMarker={state.hoveredMarker}
                    isLoading={state.isLoading}
                    setMapInstance={setMapInstance}
                    setHoveredMarker={setHoveredMarker}
                    onIdle={handleMapIdle}
                    selectedRestaurantId={selectedRestaurantId}
                />
            </MapProvider>
        </Suspense>
    )
}
