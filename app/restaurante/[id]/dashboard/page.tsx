import Navbar from '@/components/Navbar'
import { notFound } from 'next/navigation'
import { getRestaurant, getRestaurantMetrics } from '@/app/actions/restaurant'
import { RestaurantDashboard } from '@/components'

interface Props {
    params: { id: string }
}

export default async function RestauranteDashboardPage({ params }: Props) {
    const { id } = params

    const [restaurantResult, metricsResult] = await Promise.all([
        getRestaurant(id),
        getRestaurantMetrics(id),
    ])

    if (!restaurantResult.success || !restaurantResult.data) {
        notFound()
    }

    const restaurant = restaurantResult.data
    const metrics = metricsResult.success ? metricsResult.data ?? null : null

    return (
        <>
            <Navbar />
            <RestaurantDashboard
                restaurant={restaurant}
                metrics={metrics}
            />
        </>
    )
}

