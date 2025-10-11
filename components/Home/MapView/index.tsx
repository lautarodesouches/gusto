'use client'
import styles from './page.module.css'
import { GoogleMap, Marker } from '@react-google-maps/api'
import { useUserLocation } from '@/hooks/useUserLocation'

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

    const nearbyRestaurants = [
        { id: 1, name: 'Parrilla Don Julio', lat: -34.649012, lng: -58.558421 },
        { id: 2, name: 'La Farola', lat: -34.650105, lng: -58.563987 },
        { id: 3, name: 'Sushi Go', lat: -34.647881, lng: -58.561202 },
        { id: 4, name: 'Pizza Zeta', lat: -34.646711, lng: -58.559732 },
        { id: 5, name: 'Café Central', lat: -34.649705, lng: -58.557381 },
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
                    />
                ))}
            </GoogleMap>
        </section>
    )
}
