//Since the map will be laoded and displayed on client side
'use client'

// Import necessary modules and functions from external libraries and our own project
import { Libraries, useJsApiLoader } from '@react-google-maps/api'
import { ReactNode } from 'react'
import styles from './page.module.css'

// Define a list of libraries to load from the Google Maps API
const libraries = ['places', 'drawing', 'geometry']

// Define a function component called MapProvider that takes a children prop
export function MapProvider({ children }: { children: ReactNode }) {
    // Load the Google Maps JavaScript API asynchronously
    const { isLoaded: scriptLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API as string,
        libraries: libraries as Libraries,
    })

    if (loadError) {
        return (
            <div className={styles.errorContainer}>
                <p>Error al cargar Google Maps 😢</p>
            </div>
        )
    }

    if (!scriptLoaded) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p className={styles.loadingText}>Cargando mapa...</p>
            </div>
        )
    }

    // Return the children prop wrapped by this MapProvider component
    return children
}
