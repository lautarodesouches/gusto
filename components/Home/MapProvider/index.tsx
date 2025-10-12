//Since the map will be laoded and displayed on client side
'use client'

// Import necessary modules and functions from external libraries and our own project
import { Libraries, useJsApiLoader } from '@react-google-maps/api'
import { ReactNode } from 'react'
import Error from '@/components/Error'
import Loading from '@/components/Loading'

// Define a list of libraries to load from the Google Maps API
const libraries = ['places', 'drawing', 'geometry']

// Define a function component called MapProvider that takes a children prop
export function MapProvider({ children }: { children: ReactNode }) {
    // Load the Google Maps JavaScript API asynchronously
    const { isLoaded: scriptLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API as string,
        libraries: libraries as Libraries,
    })

    if (loadError) return <Error message="Error al cargar Google Maps 😢" />

    if (!scriptLoaded) return <Loading message="Cargando mapa..." />

    // Return the children prop wrapped by this MapProvider component
    return children
}
