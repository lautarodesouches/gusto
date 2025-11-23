'use client'
import styles from './styles.module.css'
import { GoogleMap, InfoWindow, Marker } from '@react-google-maps/api'
import { ROUTES } from '@/routes'
import Link from 'next/link'
import Image from 'next/image'
import { Coordinates, Restaurant } from '@/types'
import { Dispatch, SetStateAction } from 'react'

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
    zoomControl: true,
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
                <Marker
                    key={place.id || `restaurant-${index}`}
                    position={{
                        lat: place.latitud,
                        lng: place.longitud,
                    }}
                    title={place.nombre || 'Restaurante'}
                    icon={{
                        url:
                            isSelected
                                ? '/markers/markerOne.svg'
                                : index === 0
                                ? '/markers/markerOne.svg'
                                : index === 1
                                ? '/markers/markerTwo.svg'
                                : index === 2
                                ? '/markers/markerThree.svg'
                                : '/markers/marker.svg',
                        scaledSize:
                            isSelected
                                ? new google.maps.Size(48, 60)
                                : index > 2
                                ? new google.maps.Size(30, 38)
                                : new google.maps.Size(48, 60),
                        anchor:
                            isSelected
                                ? new google.maps.Point(24, 60)
                                : index > 2
                                ? new google.maps.Point(15, 38)
                                : new google.maps.Point(24, 60),
                    }}
                    animation={isSelected ? google.maps.Animation.BOUNCE : google.maps.Animation.DROP}
                    onClick={() => setHoveredMarker(index)}
                >
                    {hoveredMarker === index && (
                        <InfoWindow
                            position={{
                                lat: place.latitud,
                                lng: place.longitud,
                            }}
                            options={{
                                disableAutoPan: true,
                                pixelOffset: new google.maps.Size(0, -10),
                            }}
                            onCloseClick={() => setHoveredMarker(null)}
                        >
                            <div className={styles.info}>
                                <h3 className={styles.info__title}>{place.nombre}</h3>
                                {place.rating !== undefined && (
                                <div className={styles.info__rating}>
                                    <span className={styles.info__rating_number}>
                                        {place.rating.toFixed(1)}
                                    </span>
                                    <Image
                                        src="/images/all/star.svg"
                                        alt="Rating"
                                        width={16}
                                        height={16}
                                        className={styles.info__icon}
                                    />
                                </div>
                                )}
                                <div className={styles.info__buttons}>
                                    <Link href={`${ROUTES.RESTAURANT}${place.id}`}>
                                        <button className={styles.info__button}>
                                            Ver más
                                        </button>
                                    </Link>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.direccion)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.info__directions}
                                    >
                                        📍 Cómo llegar
                                    </a>
                                </div>
                            </div>
                        </InfoWindow>
                    )}
                </Marker>
                )
            })}
        </GoogleMap>
    )
}
