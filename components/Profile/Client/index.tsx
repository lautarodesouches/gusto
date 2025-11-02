'use client'
import { useTransition } from 'react'
import { User } from '@/types'
import { ProfileView } from '../View'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/routes'
import { addFriend, deleteFriend } from '@/app/actions/friends'

interface ProfileClientProps {
    profile: User
    isOwnProfile?: boolean
    isFriend?: boolean
}

export default function ProfileClient({
    profile,
    isOwnProfile = false,
    isFriend = true,
}: ProfileClientProps) {
    const router = useRouter()

    const handleEditTastes = () => {
        router.push(`${ROUTES.STEPS}/3`)
    }

    const handleGoPlace = (lat: number, lng: number) => {
        router.push(`${ROUTES.MAP}?near.lat=${lat}&near.lng=${lng}`)
    }

    const handleGoBack = () => {
        router.back()
    }

    const [isPending, startTransition] = useTransition()

    const handleAddFriend = async () => {
        startTransition(async () => {
            try {
                await addFriend('patricia@gmail.com', profile.username)
            } catch (err: unknown) {
                alert(err instanceof Error ? err.message : 'An error occurred')
            }
        })
    }

    const handleDeleteFriend = async () => {
        startTransition(async () => {
            try {
                await deleteFriend(
                    '50000000-0000-0000-0000-000000000222',
                    profile.username
                )
            } catch (err: unknown) {
                alert(err instanceof Error ? err.message : 'An error occurred')
            }
        })
    }

    return (
        <ProfileView
            profile={profile}
            isOwnProfile={isOwnProfile}
            isFriend={isFriend}
            onDeleteFriend={handleDeleteFriend}
            onAddFriend={handleAddFriend}
            isPending={isPending}
            onEditTastes={handleEditTastes}
            onGoPlace={handleGoPlace}
            onGoBack={handleGoBack}
        />
    )
}
