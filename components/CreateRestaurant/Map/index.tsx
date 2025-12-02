'use client'
import { useEffect, useRef, useState } from 'react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { GOOGLE_MAPS_API } from '@/constants'
import styles from './page.module.css'

const libraries: ('places' | 'drawing' | 'geometry')[] = ['places', 'drawing', 'geometry']

type RestaurantMapProps = {
    address: string
    onLocationSelect: (lat: number, lng: number, address: string) => void
    initialLat?: number
    initialLng?: number
}

export default function RestaurantMap({
    address,
    onLocationSelect,
    initialLat,
    initialLng,
}: RestaurantMapProps) {
    const [map, setMap] = useState<google.maps.Map | null>(null)
    const [markerPosition, setMarkerPosition] = useState<{
        lat: number
        lng: number
    } | null>(null)
    const [selectedAddress, setSelectedAddress] = useState<string>(address)
    const autocompleteRef = useRef<HTMLInputElement>(null)
    const autocompleteInstanceRef = useRef<google.maps.places.Autocomplete | null>(null)

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: GOOGLE_MAPS_API,
        libraries,
    })

    const defaultCenter = {
        lat: -34.603722,
        lng: -58.381592,
    }

    // Set initial marker position if provided
    useEffect(() => {
        if (initialLat && initialLng && !markerPosition) {
            setMarkerPosition({ lat: initialLat, lng: initialLng })
        }
    }, [initialLat, initialLng])

    const onLocationSelectRef = useRef(onLocationSelect)
    useEffect(() => {
        onLocationSelectRef.current = onLocationSelect
    }, [onLocationSelect])

    useEffect(() => {
        if (isLoaded && autocompleteRef.current && !autocompleteInstanceRef.current) {
            const autocomplete = new google.maps.places.Autocomplete(
                autocompleteRef.current,
                {
                    types: ['address'],
                    componentRestrictions: { country: 'ar' },
                }
            )

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace()

                if (place.geometry?.location) {
                    const latValue = typeof place.geometry.location.lat === 'function'
                        ? place.geometry.location.lat()
                        : place.geometry.location.lat
                    const lngValue = typeof place.geometry.location.lng === 'function'
                        ? place.geometry.location.lng()
                        : place.geometry.location.lng

                    const lat = parseFloat(latValue.toString())
                    const lng = parseFloat(lngValue.toString())

                    if (isNaN(lat) || isNaN(lng)) {
                        return
                    }

                    const latRounded = Math.round(lat * 10000000) / 10000000
                    const lngRounded = Math.round(lng * 10000000) / 10000000

                    const address = place.formatted_address || place.name || ''

                    setMarkerPosition({ lat: latRounded, lng: lngRounded })
                    setSelectedAddress(address)
                    onLocationSelectRef.current(latRounded, lngRounded, address)

                    if (map) {
                        map.setCenter({ lat, lng })
                        map.setZoom(17)
                    }
                }
            })

            autocompleteInstanceRef.current = autocomplete
        }
    }, [isLoaded, map])

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const latValue = typeof e.latLng.lat === 'function' ? e.latLng.lat() : e.latLng.lat
            const lngValue = typeof e.latLng.lng === 'function' ? e.latLng.lng() : e.latLng.lng

            const lat = parseFloat(latValue.toString())
            const lng = parseFloat(lngValue.toString())

            if (isNaN(lat) || isNaN(lng)) {
                return
            }

            const latRounded = Math.round(lat * 10000000) / 10000000
            const lngRounded = Math.round(lng * 10000000) / 10000000

            setMarkerPosition({ lat: latRounded, lng: lngRounded })

            const geocoder = new google.maps.Geocoder()
            geocoder.geocode({ location: { lat: latRounded, lng: lngRounded } }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const address = results[0].formatted_address
                    setSelectedAddress(address)
                    onLocationSelectRef.current(latRounded, lngRounded, address)
                } else {
                    onLocationSelectRef.current(latRounded, lngRounded, '')
                }
            })
        }
    }

    useEffect(() => {
        if (address && address !== selectedAddress) {
            setSelectedAddress(address)
            if (autocompleteRef.current) {
                autocompleteRef.current.value = address
            }
        }
    }, [address])

    if (loadError) {
        return (
            <div className={styles.error}>
                Error al cargar Google Maps. Por favor recarga la página.
            </div>
        )
    }

    if (!isLoaded) {
        return <div className={styles.loading}>Cargando mapa...</div>
    }

    return (
        <div className={styles.mapContainer}>
            <div className={styles.searchContainer}>
                <input
                    ref={autocompleteRef}
                    type="text"
                    placeholder="Busca tu dirección"
                    className={styles.searchInput}
                    defaultValue={address}
                />
            </div>
            <div className={styles.mapWrapper}>
                <GoogleMap
                    mapContainerClassName={styles.map}
                    center={markerPosition || defaultCenter}
                    zoom={markerPosition ? 17 : 12}
                    options={{
                        mapTypeControl: false,
                        streetViewControl: false,
                        fullscreenControl: false,
                        zoomControl: true,
                        clickableIcons: false,
                    }}
                    onLoad={setMap}
                    onClick={handleMapClick}
                >
                    {markerPosition && (
                        <Marker
                            position={markerPosition}
                            draggable={true}
                            onDragEnd={(e) => {
                                if (e.latLng) {
                                    const latValue = typeof e.latLng.lat === 'function' ? e.latLng.lat() : e.latLng.lat
                                    const lngValue = typeof e.latLng.lng === 'function' ? e.latLng.lng() : e.latLng.lng

                                    const lat = parseFloat(latValue.toString())
                                    const lng = parseFloat(lngValue.toString())

                                    if (isNaN(lat) || isNaN(lng)) {
                                        return
                                    }

                                    const latRounded = Math.round(lat * 10000000) / 10000000
                                    const lngRounded = Math.round(lng * 10000000) / 10000000

                                    setMarkerPosition({ lat: latRounded, lng: lngRounded })

                                    const geocoder = new google.maps.Geocoder()
                                    geocoder.geocode(
                                        { location: { lat: latRounded, lng: lngRounded } },
                                        (results, status) => {
                                            if (status === 'OK' && results && results[0]) {
                                                const address = results[0].formatted_address
                                                setSelectedAddress(address)
                                                onLocationSelectRef.current(latRounded, lngRounded, address)
                                            } else {
                                                onLocationSelectRef.current(latRounded, lngRounded, '')
                                            }
                                        }
                                    )
                                }
                            }}
                        />
                    )}
                </GoogleMap>
            </div>
            {selectedAddress && (
                <div className={styles.addressLabel}>
                    <strong>Dirección seleccionada:</strong> {selectedAddress}
                </div>
            )}
        </div>
    )
}

