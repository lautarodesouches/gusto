import { RestaurantClient } from '@/components'
import { getRestaurant } from '../actions'
import { checkFavoriteRestaurant } from '@/app/actions/favorites'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'

interface Props {
    params: Promise<{ id: string }>
}

export default async function Restaurant({ params }: Props) {
    const { id } = await params

    const result = await getRestaurant(id)

    if (!result.success || !result.data) notFound()

    const restaurant = result.data
    // Combinar reviews locales y de Google, o usar reviews antiguas como fallback
    const reviews = [
        ...(restaurant.reviewsLocales || []),
        ...(restaurant.reviewsGoogle || []),
        ...(restaurant.reviews && (!restaurant.reviewsLocales || restaurant.reviewsLocales.length === 0) && (!restaurant.reviewsGoogle || restaurant.reviewsGoogle.length === 0) ? restaurant.reviews : [])
    ]

    // Verificar si el restaurante es favorito en el servidor
    const favoriteResult = await checkFavoriteRestaurant(restaurant.id)
    const initialIsFavorite = favoriteResult.success && favoriteResult.data ? favoriteResult.data.isFavourite : false

    return (
        <>
            <Navbar />
            <RestaurantClient 
                restaurant={restaurant} 
                reviews={reviews} 
                initialIsFavorite={initialIsFavorite}
            />
        </>
    )
}
