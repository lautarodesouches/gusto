import { checkIsFriend } from '@/app/actions/friends'
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

    const { data: dataFriend } = await checkIsFriend(username)
    const isFriend = dataFriend?.isFriend ?? false

    if (!result.success || !result.data) notFound()

    const { esMiPerfil, esAmigo } = result.data

    return (
        <main className={styles.main}>
            <ProfileClient profile={result.data} isFriend={isFriend} />
        </main>
    )
}