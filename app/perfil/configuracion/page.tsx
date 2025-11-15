import { getCurrentUserProfile } from '@/app/actions/profile'
import ProfileConfigClient from '@/components/ProfileConfig/Client'
import { notFound } from 'next/navigation'

export default async function ConfigurationPage() {
    const result = await getCurrentUserProfile()

    if (!result.success || !result.data) {
        notFound()
    }

    return <ProfileConfigClient profile={result.data} />
}

