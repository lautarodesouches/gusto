import styles from './styles.module.css'
import { getProfile } from '@/app/perfil/actions'
import { ProfileClient } from '@/components'
import { notFound } from 'next/navigation'

interface Props {
    params: Promise<{ username: string }>
}

export default async function Profile({ params }: Props) {
    const { username } = await params

    const result = await getProfile(username)

    if (!result.success || !result.data) notFound()

    return (
        <main className={styles.main}>
            <ProfileClient profile={result.data} />
        </main>
    )
}
