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
import { searchRestaurants } from '@/app/actions/restaurants'

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
                const restaurants = Array.isArray(data) 
                    ? data 
                    : (data.recomendaciones || [])

                // Filtrar restaurantes con coordenadas válidas
                // NO filtrar por PlaceId, foto, rating, ni ningún otro campo - solo coordenadas válidas
                const validRestaurants = restaurants.filter((r: Record<string, unknown>) => {
                    const lat = r.latitud ?? r.Latitud
                    const lng = r.longitud ?? r.Longitud
                    
                    // Validar que las coordenadas sean números válidos y estén en rangos geográficos
                    const isValidLat = typeof lat === 'number' && !isNaN(lat) && lat >= -90 && lat <= 90
                    const isValidLng = typeof lng === 'number' && !isNaN(lng) && lng >= -180 && lng <= 180
                    
                    if (!isValidLat || !isValidLng) {
                        return false
                    }
                    
                    // Aceptar todos los restaurantes con coordenadas válidas, sin importar PlaceId, foto, rating, etc.
                    return true
                })

                // Mapear restaurantes para normalizar campos (PascalCase a camelCase)
                // Aceptar TODOS los restaurantes con coordenadas válidas, sin importar PlaceId, foto, etc.
                const mappedRestaurants = validRestaurants
                    .map((r: Record<string, unknown>) => {
                    const lat = r.latitud ?? r.Latitud ?? 0
                    const lng = r.longitud ?? r.Longitud ?? 0
                    
                    // El backend envía GooglePlaceId (no PlaceId)
                    const googlePlaceId = r.googlePlaceId || r.GooglePlaceId || ''
                    const placeId = r.placeId || r.PlaceId || googlePlaceId
                    
                    // LÓGICA: Si NO tiene GooglePlaceId, entonces es de la app (sin importar EsDeLaApp del backend)
                    // Si tiene GooglePlaceId, entonces NO es de la app
                    // Esto corrige el caso donde el backend envía EsDeLaApp=false pero no tiene GooglePlaceId
                    const tieneGooglePlaceId = googlePlaceId && googlePlaceId !== null && googlePlaceId !== '' && String(googlePlaceId).trim() !== ''
                    const esDeLaApp = !tieneGooglePlaceId
                    
                    // Asegurar que el ID sea válido (no puede estar vacío)
                    const rawId = r.id || r.Id
                    if (!rawId || String(rawId).trim() === '') {
                        console.warn('⚠️ Restaurante sin ID válido omitido:', {
                            nombre: r.nombre || r.Nombre,
                            datos: r
                        })
                        return null
                    }
                    
                    const mapped: Restaurant = {
                        id: String(rawId),
                        nombre: String(r.nombre || r.Nombre || 'Sin nombre'),
                        direccion: String(r.direccion || r.Direccion || ''),
                        latitud: typeof lat === 'number' ? lat : parseFloat(String(lat)) || 0,
                        longitud: typeof lng === 'number' ? lng : parseFloat(String(lng)) || 0,
                        rating: (r.rating ?? r.Rating ?? r.valoracion ?? r.Valoracion) as number | undefined,
                        categoria: (r.categoria || r.Categoria || undefined) as string | undefined,
                        imagenUrl: (r.imagenUrl || r.ImagenUrl || undefined) as string | undefined,
                        esDeLaApp: esDeLaApp,
                        placeId: (placeId ? String(placeId) : null) as string | null,
                        googlePlaceId: (googlePlaceId ? String(googlePlaceId) : null) as string | null,
                        imagenesInterior: Array.isArray(r.imagenesInterior) ? r.imagenesInterior : [],
                        imagenesComida: Array.isArray(r.imagenesComida) ? r.imagenesComida : [],
                        reviewsLocales: Array.isArray(r.reviewsLocales) ? r.reviewsLocales : [],
                        reviewsGoogle: Array.isArray(r.reviewsGoogle) ? r.reviewsGoogle : [],
                    }
                    
                    return mapped
                })
                .filter((r): r is Restaurant => r !== null) // Filtrar los null

                setState(prev => ({
                    ...prev,
                    restaurants: mappedRestaurants,
                    isLoading: false,
                }))

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
