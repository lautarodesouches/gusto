'use client'
import styles from './page.module.css'
import { GoogleMap } from '@react-google-maps/api'

//Map's styling
const defaultMapContainerStyle = {
    width: '100%',
    height: '100vh',
}

//K2's coordinates
const defaultMapCenter = {
    lat: -34.6482541,
    lng: -58.5602033,
}

//Default zoom level, can be adjusted
const defaultMapZoom = 15

//Map options
const defaultMapOptions = {
    zoomControl: true,
    tilt: 0,
    gestureHandling: 'auto',
    mapTypeId: 'satellite',
}

export default function Map() {
    return (
        <div className={styles.map}>
            <GoogleMap
                mapContainerStyle={defaultMapContainerStyle}
                center={defaultMapCenter}
                zoom={defaultMapZoom}
                options={defaultMapOptions}
            />
        </div>
    )
}
