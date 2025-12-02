import { RestaurantClient } from '@/components'
import { getRestaurant } from '@/app/actions/restaurant'
import { checkFavoriteRestaurant } from '@/app/actions/favorites'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'

import { Metadata } from 'next'

interface Props {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params
    const restaurant = await getRestaurant(id)

    if (!restaurant.success || !restaurant.data) {
        return {
            title: 'Restaurante no encontrado | Gusto',
        }
    }

    return {
        title: `${restaurant.data.nombre} | Gusto`,
        description: `Descubrí ${restaurant.data.nombre} en Gusto. Mirá opiniones, fotos y más.`,
    }
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
