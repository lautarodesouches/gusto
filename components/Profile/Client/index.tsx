'use client'
import { useTransition } from 'react'
import { User } from '@/types'
import { ProfileView } from '../View'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/routes'
import { addFriend, deleteFriend } from '@/app/actions/friends'
import { useToast } from '@/context/ToastContext'

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
    const toast = useToast()

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
                const result = await addFriend(
                    'patricia@gmail.com',
                    profile.username
                )

                if (!result.success)
                    return toast.error(
                        result.error || 'No se pudo enviar la solicitud'
                    )

                toast.success('Solicitud de amistad enviada')
            } catch (err: unknown) {
                console.error(err)
                toast.error(
                    err instanceof Error ? err.message : 'Ocurrió un error'
                )
            }
        })
    }

    const handleDeleteFriend = async () => {
        startTransition(async () => {
            try {
                const result = await deleteFriend(
                    '50000000-0000-0000-0000-000000000222',
                    profile.username
                )

                if (!result.success)
                    return toast.error(
                        result.error || 'No se pudo eliminar al amigo'
                    )

                toast.success('Amigo eliminado correctamente')
            } catch (err: unknown) {
                console.error(err)
                toast.error(
                    err instanceof Error ? err.message : 'Ocurrió un error'
                )
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
