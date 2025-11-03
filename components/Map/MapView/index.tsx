'use client'
import styles from './page.module.css'
import { GoogleMap, InfoWindow, Marker } from '@react-google-maps/api'
import { useUserLocation } from '@/hooks/useUserLocation'
import { useCallback, useEffect, useState } from 'react'
import { Restaurant } from '@/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import Error from '@/components/Error'
import Loading from '@/components/Loading'
import { useRouter, useSearchParams } from 'next/navigation'
import { ROUTES } from '@/routes'
import Link from 'next/link'

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

export default function Map() {
    const { coords, error, loading } = useUserLocation()
    const router = useRouter()
    const searchParams = useSearchParams()

    const [hoveredMarker, setHoveredMarker] = useState<number | null>(null)
    const [restaurants, setRestaurants] = useState<Restaurant[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [center, setCenter] = useState({
        lat: coords?.lat || defaultMapCenter.lat,
        lng: coords?.lng || defaultMapCenter.lng,
    })
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)

    const fetchRestaurants = useCallback(async () => {
        try {
            const query = new URLSearchParams()

            query.append('near.lat', String(center.lat))
            query.append('near.lng', String(center.lng))

            const tipo = searchParams.get('tipo')
            if (tipo) query.append('tipo', tipo)
            const plato = searchParams.get('plato')
            if (plato) query.append('plato', plato)

            const res = await fetch(`/api/restaurants?${query.toString()}`)

            if (res.status === 401) return router.push(ROUTES.LOGIN)

            if (!res.ok) throw 'Error al cargar restaurantes'

            const data = await res.json()

                setRestaurants(Array.isArray(data.recomendaciones) ? data.recomendaciones : []);

        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }, [searchParams, center])

    useEffect(() => {
        fetchRestaurants()
    }, [fetchRestaurants])

    const handleIdle = () => {
        if (!mapInstance) return
        const newCenter = mapInstance.getCenter()
        if (!newCenter) return

        const lat = newCenter.lat()
        const lng = newCenter.lng()

        // Solo actualizamos si cambió realmente
        if (lat !== center.lat || lng !== center.lng) {
            setCenter({ lat, lng })

            // Actualizamos la URL incluyendo pathname actual
            const query = new URLSearchParams(searchParams.toString())
            query.set('near.lat', String(lat))
            query.set('near.lng', String(lng))
            router.replace(`${window.location.pathname}?${query.toString()}`)
        }
    }
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
                onLoad={map => setMapInstance(map)}
                onIdle={handleIdle}
            >
               {restaurants.map((place, index) => (
                   <Marker
                       key={index}
                       position={{
                           lat: place.lat,
                           lng: place.lng,
                           }}
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
                            scaledSize: new google.maps.Size(36, 45),
                            anchor: new google.maps.Point(18, 45),
                        }}
                        animation={google.maps.Animation.DROP}
                        onClick={() => setHoveredMarker(index)}
                    >
                        {hoveredMarker === index && (
                            <InfoWindow
                                position={{
                                    lat: place.lat,
                                    lng: place.lng,
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
