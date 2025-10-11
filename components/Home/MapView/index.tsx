'use client'
import styles from './page.module.css'
import { GoogleMap, InfoWindow, Marker } from '@react-google-maps/api'
import { useUserLocation } from '@/hooks/useUserLocation'
import { useState } from 'react'
import { Restaurant } from '@/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'

// Default coordinates (fallback)
const defaultMapCenter = {
    lat: -34.649012,
    lng: -58.558421,
}

// Default zoom level
const defaultMapZoom = 15

// Map options
const defaultMapOptions = {
    zoomControl: true,
    tilt: 0,
    gestureHandling: 'auto',
    mapTypeId: 'roadmap',
}

export default function Map() {
    const { coords, error, loading } = useUserLocation()
    const [hoveredMarker, setHoveredMarker] = useState<number | null>(null)

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <p>{error}</p>
            </div>
        )
    }

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p className={styles.loadingText}>Obteniendo ubicación...</p>
            </div>
        )
    }

    const nearbyRestaurants: Restaurant[] = [
        {
            id: 1,
            name: 'Parrilla Don Julio',
            lat: -34.649012,
            lng: -58.558421,
            rating: 4.7,
            img: 'https://brujulea.net/public/400/7sfepg5vqssr.jpg',
        },
        {
            id: 2,
            name: 'La Farola',
            lat: -34.650105,
            lng: -58.563987,
            rating: 4.9,
            img: 'https://brujulea.net/public/400/7sfepg5vqssr.jpg',
        },
        {
            id: 3,
            name: 'Sushi Go',
            lat: -34.647881,
            lng: -58.561202,
            rating: 4.2,
            img: 'https://brujulea.net/public/400/7sfepg5vqssr.jpg',
        },
        {
            id: 4,
            name: 'Pizza Zeta',
            lat: -34.646711,
            lng: -58.559732,
            rating: 3.6,
            img: 'https://brujulea.net/public/400/7sfepg5vqssr.jpg',
        },
        {
            id: 5,
            name: 'Café Central',
            lat: -34.649705,
            lng: -58.557381,
            rating: 3.8,
            img: 'https://brujulea.net/public/400/7sfepg5vqssr.jpg',
        },
    ]

    return (
        <section className={styles.map}>
            <GoogleMap
                mapContainerClassName={styles.mapContainer}
                center={coords || defaultMapCenter}
                zoom={defaultMapZoom}
                options={defaultMapOptions}
            >
                {nearbyRestaurants.map(place => (
                    <Marker
                        key={place.id}
                        position={{ lat: place.lat, lng: place.lng }}
                        title={place.name}
                        icon={{
                            url: '/svg/marker.svg',
                            scaledSize: new google.maps.Size(36, 45),
                            anchor: new google.maps.Point(18, 45),
                        }}
                        animation={google.maps.Animation.DROP}
                        onMouseOver={() => setHoveredMarker(place.id)}
                        onMouseOut={() => setHoveredMarker(null)}
                    >
                        {hoveredMarker === place.id && (
                            <InfoWindow
                                position={{ lat: place.lat, lng: place.lng }}
                                options={{
                                    disableAutoPan: true,
                                }}
                            >
                                <article className={styles.info}>
                                    <img src={place.img} alt={place.name} className={styles.inf__img} />
                                    <h4 className={styles.info__title}>
                                        {place.name}
                                    </h4>
                                    <p className={styles.info__rating}>
                                        {place.rating}
                                        <FontAwesomeIcon
                                            icon={faStar}
                                            className={styles.info__icon}
                                        />
                                    </p>
                                    <button className={styles.info__button}>
                                        Más información
                                    </button>
                                </article>
                            </InfoWindow>
                        )}
                    </Marker>
                ))}
            </GoogleMap>
        </section>
    )
}
