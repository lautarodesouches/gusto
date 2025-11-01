import { RestaurantClient } from '@/components'
import { getReviewsByRestaurantId, getRestaurant } from '../actions'
import { notFound } from 'next/navigation'

interface Props {
    params: Promise<{ id: string }>
}

export default async function Restaurant({ params }: Props) {
    const { id } = await params

    const result = await getRestaurant(id)    

    if (!result.success || !result.data) notFound()

    const { data: reviews } = await getReviewsByRestaurantId(result.data.id)

    return <RestaurantClient restaurant={result.data} reviews={reviews || []} />
}
