import { getCurrentUser } from '@/app/actions/profile'
import ProfileConfigClient from '@/components/ProfileConfig/Client'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ConfigurationPage() {
    const result = await getCurrentUser()

    if (!result.success || !result.data) {
        notFound()
    }

    return <ProfileConfigClient profile={result.data} />
}

