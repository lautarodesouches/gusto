import styles from './styles.module.css'
import { getProfile } from '@/app/profile/actions'
import { ProfileClient } from '@/components'
import { notFound } from 'next/navigation'

interface Props {
    params: Promise<{ userId: string }>
}

export default async function Profile({ params }: Props) {
    const { userId } = await params

    const result = await getProfile(userId)

    if (!result.success || !result.data) notFound()

    return (
        <main className={styles.main}>
            <ProfileClient
                profile={result.data}
            />
        </main>
    )
}
