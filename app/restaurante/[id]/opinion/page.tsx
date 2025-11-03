import { notFound } from 'next/navigation'
import { getRestaurant } from '../../actions'
import ReviewForm from '@/components/Review/Form'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function OpinionPage({ params }: PageProps) {
    const { id } = await params

    const result = await getRestaurant(id)

    if (!result.success || !result.data) {
        notFound()
    }

    return <ReviewForm restaurant={result.data} />
}
