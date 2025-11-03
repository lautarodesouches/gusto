'use client'
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api'
import { useState } from 'react'

interface RestaurantMapProps {
    lat: number
    lng: number
    name: string
    address?: string
}

export default function RestaurantMap({
    lat,
    lng,
    name,
    address,
}: RestaurantMapProps) {
    const [open, setOpen] = useState(false)

    return (
        <GoogleMap
            mapContainerClassName="restaurant-map"
            center={{ lat, lng }}
            zoom={15}
            options={{
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            }}
        >
            <Marker
                position={{ lat, lng }}
                onClick={() => setOpen(true)}
                title={name}
            />
            {open && (
                <InfoWindow
                    position={{ lat, lng }}
                    onCloseClick={() => setOpen(false)}
                >
                    <div className="restaurant-map__info">
                        <h4 className="restaurant-map__title">{name}</h4>
                        {address && (
                            <p className="restaurant-map__address">{address}</p>
                        )}
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    )
}
