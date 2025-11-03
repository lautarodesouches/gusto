'use client'
import styles from './styles.module.css'
import { GoogleMap, InfoWindow, Marker } from '@react-google-maps/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import { ROUTES } from '@/routes'
import Link from 'next/link'
import { Coordinates, Restaurant } from '@/types'
import { Dispatch, SetStateAction } from 'react'

// Default coordinates (fallback)
const defaultMapCenter = {
    lat: -34.6488,
    lng: -58.5605,
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

interface Props {
    coords: Coordinates | null
    restaurants: Restaurant[]
    hoveredMarker: number | null
    isLoading: boolean
    setMapInstance: Dispatch<SetStateAction<google.maps.Map | null>>
    onIdle: () => void
    setHoveredMarker: (markerId: number | null) => void
}

export default function MapView({
    coords,
    restaurants,
    hoveredMarker,
    setMapInstance,
    onIdle,
    setHoveredMarker,
}: Props) {
    return (
        <section className={styles.map}>
            <GoogleMap
                mapContainerClassName={styles.mapContainer}
                center={coords || defaultMapCenter}
                zoom={defaultMapZoom}
                options={defaultMapOptions}
                onLoad={map => setMapInstance(map)}
                onIdle={onIdle}
            >
<<<<<<< HEAD
               {restaurants.map((place, index) => (
                   <Marker
                       key={index}
                       position={{
                           lat: place.latitud,
                           lng: place.longitud,
                           }}
=======
                {restaurants.map((place, index) => (
                    <Marker
                        key={index}
                        position={{
                            lat: place.lat,
                            lng: place.lng,
                        }}
>>>>>>> develop
                        title={place.nombre}
                        icon={{
                            url:
                                index === 0
                                    ? '/markers/markerOne.svg'
                                    : index === 1
                                    ? '/markers/markerTwo.svg'
                                    : index === 2
                                    ? '/markers/markerThree.svg'
                                    : '/markers/marker.svg',
                            scaledSize:
                                index > 2
                                    ? new google.maps.Size(30, 38)
                                    : new google.maps.Size(48, 60),
                            anchor:
                                index > 2
                                    ? new google.maps.Point(15, 38)
                                    : new google.maps.Point(24, 60),
                        }}
                        animation={google.maps.Animation.DROP}
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
                                    headerContent: place.nombre,
                                }}
                                onCloseClick={() => setHoveredMarker(null)}
                            >
                                <div className={styles.info}>
                                    <p className={styles.info__rating}>
                                        {place.rating.toFixed(2)}
                                        <FontAwesomeIcon
                                            icon={faStar}
                                            className={styles.info__icon}
                                        />
                                    </p>
                                    <Link
                                        href={`${ROUTES.RESTAURANT}${place.id}`}
                                    >
                                        <button className={styles.info__button}>
                                            Más información
                                        </button>
                                    </Link>
                                </div>
                            </InfoWindow>
                        )}
                    </Marker>
                ))}
            </GoogleMap>
        </section>
    )
}
