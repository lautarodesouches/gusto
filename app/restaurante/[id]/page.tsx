import { RestaurantClient } from '@/components'
import { getRestaurant } from '../actions'
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
    const reviews = restaurant.reviews || []

    return (
        <>
            <Navbar />
            <RestaurantClient restaurant={restaurant} reviews={reviews} />
        </>
    )
}
