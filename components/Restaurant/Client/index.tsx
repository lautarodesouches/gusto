'use client'
import { Restaurant, Review } from '@/types'
import RestaurantView from '../View'
import { useState, useEffect } from 'react'
import { useToast } from '@/context/ToastContext'
import { addFavoriteRestaurant, removeFavoriteRestaurant, checkFavoriteRestaurant } from '@/app/actions/favorites'

// Tipo para la respuesta con información de límite
type FavoriteLimitResponse = {
    success: false
    error: 'LIMITE_FAVORITOS_ALCANZADO'
    tipoPlan?: string
    limiteActual?: number
    favoritosActuales?: number
    beneficios?: unknown
    linkPago?: string
    message?: string
}
import FavoriteLimitFloatingCard from '@/components/Premium/FavoriteLimitFloatingCard'

interface Props {
    restaurant: Restaurant
    reviews: Review[]
}

export default function RestaurantClient({ restaurant, reviews }: Props) {
    // Inicializar con el valor del servidor si está disponible, o false por defecto
    const [isFavourite, setIsFavourite] = useState(restaurant.esFavorito ?? false)
    const [isLoading, setIsLoading] = useState(false)
    const [showLimitCard, setShowLimitCard] = useState(false)
    const [limitInfo, setLimitInfo] = useState<{
        tipoPlan?: string
        limiteActual?: number
        favoritosActuales?: number
    } | undefined>(undefined)
    const toast = useToast()

    // Solo verificar si no viene del servidor (fallback)
    useEffect(() => {
        // Si el restaurante ya tiene esFavorito del servidor, no necesitamos verificar
        if (restaurant.esFavorito !== undefined) {
            setIsFavourite(restaurant.esFavorito)
            return
        }

        // Si no viene del servidor, verificar en el cliente
        const checkFavourite = async () => {
            setIsLoading(true)
            try {
                const result = await checkFavoriteRestaurant(restaurant.id)
                if (result.success && result.data) {
                    setIsFavourite(result.data.isFavourite)
                }
            } catch (error) {
                console.error('Error al verificar favorito:', error)
            } finally {
                setIsLoading(false)
            }
        }
        checkFavourite()
    }, [restaurant.id, restaurant.esFavorito])

    const handleFavourite = async () => {
        if (isLoading) return

        setIsLoading(true)
        try {
            if (isFavourite) {
                // Quitar de favoritos
                const result = await removeFavoriteRestaurant(restaurant.id)

                if (!result.success) {
                    throw new Error(result.error || 'Error al quitar de favoritos')
                }

                setIsFavourite(false)
                toast.success('Restaurante eliminado de guardados')
            } else {
                // Agregar a favoritos
                const result = await addFavoriteRestaurant(restaurant.id)

                if (!result.success) {
                    // Verificar si es error de límite de favoritos
                    const limitResult = result as FavoriteLimitResponse
                    if (result.error === 'LIMITE_FAVORITOS_ALCANZADO' || limitResult.tipoPlan) {
                        setLimitInfo({
                            tipoPlan: limitResult.tipoPlan,
                            limiteActual: limitResult.limiteActual,
                            favoritosActuales: limitResult.favoritosActuales,
                        })
                        setShowLimitCard(true)
                        return
                    }
                    throw new Error(result.error || 'Error al guardar restaurante')
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
        <>
            <RestaurantView
                restaurant={restaurant}
                reviews={reviews}
                isFavourite={isFavourite}
                onFavourite={handleFavourite}
            />
            <FavoriteLimitFloatingCard
                isOpen={showLimitCard}
                onClose={() => setShowLimitCard(false)}
                limitInfo={limitInfo}
            />
        </>
    )
}
