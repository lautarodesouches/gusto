/* eslint-disable @next/next/no-img-element */
'use client'
import styles from './page.module.css'
import { GoogleMap, InfoWindow, Marker } from '@react-google-maps/api'
import { useUserLocation } from '@/hooks/useUserLocation'
import { useEffect, useState } from 'react'
import { Restaurant } from '@/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import Error from '@/components/Error'
import Loading from '@/components/Loading'

// Default coordinates (fallback)
const defaultMapCenter = {
    lat: -34.6482,
    lng: -58.5623,
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
    const [restaurants, setRestaurants] = useState<Restaurant[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const res = await fetch('/api/restaurants')
                if (!res.ok) throw 'Error al cargar restaurantes'
                const data = await res.json()
                setRestaurants(data)
            } catch (err) {
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchRestaurants()
    }, [])

    if (error) return <Error message={error} />
    if (loading || isLoading)
        return <Loading message="Obteniendo ubicación y restaurantes..." />

    return (
        <section className={styles.map}>
            <GoogleMap
                mapContainerClassName={styles.mapContainer}
                center={coords || defaultMapCenter}
                zoom={defaultMapZoom}
                options={defaultMapOptions}
            >
                {restaurants.map((place, index) => (
                    <Marker
                        key={index}
                        position={{
                            lat: place.latitud,
                            lng: place.longitud,
                        }}
                        title={place.nombre}
                        icon={{
                            url: '/svg/marker.svg',
                            scaledSize: new google.maps.Size(36, 45),
                            anchor: new google.maps.Point(18, 45),
                        }}
                        animation={google.maps.Animation.DROP}
                        onMouseOver={() => setHoveredMarker(index)}
                        onMouseOut={() => setHoveredMarker(null)}
                    >
                        {hoveredMarker === index && (
                            <InfoWindow
                                position={{
                                    lat: place.latitud,
                                    lng: place.longitud,
                                }}
                                options={{
                                    disableAutoPan: true,
                                }}
                            >
                                <article className={styles.info}>
                                    <img
                                        src={place.imagenUrl}
                                        alt={place.nombre}
                                        className={styles.info__img}
                                    />
                                    <h4 className={styles.info__title}>
                                        {place.nombre}
                                    </h4>
                                    <p className={styles.info__rating}>
                                        {place.valoracion.toFixed(1)}
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
