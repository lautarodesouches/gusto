'use client'
import { GoogleMap } from '@react-google-maps/api'
import { Coordinates, Restaurant } from '@/types'
import { Dispatch, SetStateAction } from 'react'
import RestaurantMarker from './RestaurantMarker'

// Default coordinates (fallback)
const defaultMapCenter = {
    lat: -34.6717283,
    lng: -58.5639719,
}

// Default zoom level
const defaultMapZoom = 15

const cleanMapStyle: google.maps.MapTypeStyle[] = [
    // 🔹 Oculta todos los puntos de interés (restaurantes, hospitales, etc.)
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    // 🔹 Opcional: simplifica caminos
    {
        featureType: 'road',
        elementType: 'labels.icon',
        stylers: [{ visibility: 'off' }],
    },
    // 🔹 Opcional: oculta nombres de barrios
    {
        featureType: 'administrative.neighborhood',
        stylers: [{ visibility: 'off' }],
    },
]

// Map options
const defaultMapOptions = {
    zoomControl: false,
    tilt: 0,
    gestureHandling: 'auto',
    mapTypeId: 'roadmap',
    mapTypeControl: false, // Switch map-satellite
    streetViewControl: false,
    fullscreenControl: false,
    clickableIcons: false, // Public places pins
    disableDefaultUI: true,
    styles: cleanMapStyle,
}

interface Props {
    containerStyle: string
    coords: Coordinates | null
    restaurants: Restaurant[]
    hoveredMarker: number | null
    isLoading: boolean
    setMapInstance: Dispatch<SetStateAction<google.maps.Map | null>>
    onIdle: () => void
    setHoveredMarker: (markerId: number | null) => void
    selectedRestaurantId?: string | null
}

export default function MapView({
    containerStyle,
    coords,
    restaurants,
    hoveredMarker,
    setMapInstance,
    onIdle,
    setHoveredMarker,
    selectedRestaurantId,
}: Props) {
    return (
        <GoogleMap
            mapContainerClassName={containerStyle}
            center={coords || defaultMapCenter}
            zoom={defaultMapZoom}
            options={defaultMapOptions}
            onLoad={map => setMapInstance(map)}
            onIdle={onIdle}
        >
            {restaurants.length === 0 && (
                <div style={{ display: 'none' }}>
                    No hay restaurantes para mostrar
                </div>
            )}
            {restaurants.map((place, index) => {
                // Validar que tenga coordenadas válidas antes de renderizar
                if (!place.latitud || !place.longitud || 
                    isNaN(place.latitud) || isNaN(place.longitud) ||
                    place.latitud === 0 || place.longitud === 0) {
                    return null
                }
                
                const isSelected = selectedRestaurantId && place.id === selectedRestaurantId
                return (
                    <RestaurantMarker
                        key={place.id || `restaurant-${index}`}
                        place={place}
                        index={index}
                        isSelected={!!isSelected}
                        isHovered={hoveredMarker === index}
                        setHoveredMarker={setHoveredMarker}
                    />
                )
            })}
        </GoogleMap>
    )
}
