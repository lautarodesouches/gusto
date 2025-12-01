'use client'
import { Restaurant, Review } from '@/types'
import RestaurantView from '../View'
import { useState, useEffect } from 'react'
import { useToast } from '@/context/ToastContext'
import { addFavoriteRestaurant, removeFavoriteRestaurant } from '@/app/actions/favorites'

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
import UpgradePremiumModal from '@/components/Premium/UpgradePremiumModal'

interface Props {
    restaurant: Restaurant
    reviews: Review[]
    initialIsFavorite?: boolean
}

export default function RestaurantClient({ restaurant, reviews, initialIsFavorite = false }: Props) {
    const [isFavourite, setIsFavourite] = useState(initialIsFavorite)
    const [isLoading, setIsLoading] = useState(false)
    const [showLimitCard, setShowLimitCard] = useState(false)
    const [limitInfo, setLimitInfo] = useState<{
        tipoPlan?: string
        limiteActual?: number
        favoritosActuales?: number
    } | undefined>(undefined)
    const toast = useToast()

    // Ya no necesitamos verificar en el useEffect porque viene del servidor
    // Solo actualizamos si cambia el restaurante
    useEffect(() => {
        setIsFavourite(initialIsFavorite)
    }, [restaurant.id, initialIsFavorite])

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
            <UpgradePremiumModal
                isOpen={showLimitCard}
                onClose={() => setShowLimitCard(false)}
                trigger="general"
                limitInfo={limitInfo ? {
                    ...limitInfo,
                    tipoPlan: limitInfo.tipoPlan || 'Free',
                    limiteActual: limitInfo.limiteActual || 0,
                    gruposActuales: limitInfo.favoritosActuales || 0
                } : undefined}
            />
        </>
    )
}
