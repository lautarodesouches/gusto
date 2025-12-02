import Navbar from '@/components/Navbar'
import { notFound } from 'next/navigation'
import { getRestaurant, getRestaurantMetrics } from '@/app/actions/restaurant'
import { getMyRestaurant } from '@/app/actions/restaurants'
import { RestaurantDashboard } from '@/components'

interface Props {
    params: { id: string }
}

export default async function RestauranteDashboardPage({ params }: Props) {
    const { id } = await params

    // Verificar que el usuario sea el dueño del restaurante
    const myRestaurantResult = await getMyRestaurant()
    let myRestaurantId: string | null = null

    if (myRestaurantResult.success && myRestaurantResult.data) {
        const data = myRestaurantResult.data
        if (typeof data === 'string') {
            myRestaurantId = data
        } else if (data && typeof data === 'object') {
            myRestaurantId = data.id || data.Id || null
        }
    }

    // Si el restaurante solicitado no coincide con el del usuario, no permitir acceso
    if (myRestaurantId && myRestaurantId !== id) {
        notFound()
    }

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

