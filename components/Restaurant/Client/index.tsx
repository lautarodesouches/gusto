'use client'
import { Restaurant, Review } from '@/types'
import RestaurantView from '../View'

interface Props {
    restaurant: Restaurant
    reviews: Review[]
}

export default function RestaurantClient({ restaurant, reviews }: Props) {
    const handleFavourite = () => {}

    return (
        <RestaurantView
            restaurant={restaurant}
            reviews={reviews}
            isFavourite={false}
            onFavourite={handleFavourite}
        />
    )
}
