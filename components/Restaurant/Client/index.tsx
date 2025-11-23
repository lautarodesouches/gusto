'use client'
import { Restaurant, Review } from '@/types'
import RestaurantView from '../View'
import { useState, useEffect } from 'react'
import { useToast } from '@/context/ToastContext'

interface Props {
    restaurant: Restaurant
    reviews: Review[]
}

export default function RestaurantClient({ restaurant, reviews }: Props) {
    const [isFavourite, setIsFavourite] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const toast = useToast()

    // Verificar si el restaurante ya es favorito al cargar
    useEffect(() => {
        const checkFavourite = async () => {
            try {
                const response = await fetch(`/api/restaurante/favorito/verificar/${restaurant.id}`)
                if (response.ok) {
                    const data = await response.json()
                    setIsFavourite(data.isFavourite || false)
                }
            } catch (error) {
                console.error('Error al verificar favorito:', error)
            } finally {
                setIsLoading(false)
            }
        }
        checkFavourite()
    }, [restaurant.id])

    const handleFavourite = async () => {
        if (isLoading) return

        setIsLoading(true)
        try {
            if (isFavourite) {
                // Quitar de favoritos
                const response = await fetch(`/api/restaurante/favorito/${restaurant.id}`, {
                    method: 'DELETE',
                })

                if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.error || 'Error al quitar de favoritos')
                }

                setIsFavourite(false)
                toast.success('Restaurante eliminado de guardados')
            } else {
                // Agregar a favoritos
                const response = await fetch(`/api/restaurante/favorito/${restaurant.id}`, {
                    method: 'POST',
                })

                if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.error || 'Error al guardar restaurante')
                }

                setIsFavourite(true)
                toast.success('Restaurante guardado')
            }
        } catch (error) {
            console.error('Error al manejar favorito:', error)
            toast.error(error instanceof Error ? error.message : 'Error al guardar restaurante')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <RestaurantView
            restaurant={restaurant}
            reviews={reviews}
            isFavourite={isFavourite}
            onFavourite={handleFavourite}
        />
    )
}
