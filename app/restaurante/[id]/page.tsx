import { RestaurantClient } from '@/components'
import { getRestaurant } from '../actions'
import { notFound } from 'next/navigation'

interface Props {
    params: Promise<{ id: string }>
}

export default async function Restaurant({ params }: Props) {
    const { id } = await params

    console.log(id)

    const result = await getRestaurant(id)

    console.log(result)

    if (!result.success || !result.data) notFound()

    const restaurant = result.data
    const reviews = restaurant.reviews || []

    return <RestaurantClient restaurant={restaurant} reviews={reviews} />
}
