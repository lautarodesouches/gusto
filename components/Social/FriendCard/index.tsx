'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './page.module.css'
import { Friend } from '@/types'
import {
    faCircleCheck,
    faCirclePlus,
    faThumbsDown,
    faThumbsUp,
    faUser,
} from '@fortawesome/free-solid-svg-icons'
import { useState, useEffect } from 'react'
import { ROUTES } from '@/routes'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { addFriend, respondToFriendInvitation } from '@/app/actions/friends'
import { useToast } from '@/context/ToastContext'
import Image from 'next/image'

export default function FriendCard({
    friend,
    isSearching,
    invitationId,
    showOnlyImage = false,
}: {
    friend: Friend
    isSearching?: boolean
    invitationId?: string
    showOnlyImage?: boolean
}) {
    const toast = useToast()

    const [loading, setLoading] = useState(false)
    const [isInvitating, setIsInvitating] = useState(false)

    useEffect(() => {
        const handleSolicitudEliminada = (event: CustomEvent) => {
            const username = (event.detail as { username?: string })?.username
            if (username && username === friend.username) {
                setIsInvitating(false)
            }
        }

        const handleFriendsRefresh = () => {
            setIsInvitating(false)
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('solicitud:eliminada', handleSolicitudEliminada as EventListener)
            window.addEventListener('friends:refresh', handleFriendsRefresh)
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('solicitud:eliminada', handleSolicitudEliminada as EventListener)
                window.removeEventListener('friends:refresh', handleFriendsRefresh)
            }
        }
    }, [friend.username])

    const handleAddFriend = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (isInvitating) {
            return toast.info('Ya enviaste una solicitud a este usuario')
        }
        setLoading(true)

        try {
            const result = await addFriend(friend.username)

            if (!result.success)
                return toast.error(
                    result.error || `No se pudo enviar solicitud`
                )

            setIsInvitating(true)

            toast.success(`Solicitud de amistad enviada`)
        } catch (err: unknown) {
            toast.error(`No se pudo enviar solicitud`)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (action: 'aceptar' | 'rechazar', e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!invitationId) return

        setLoading(true)

        try {
            const result = await respondToFriendInvitation(invitationId, action)

            if (!result.success)
                return toast.error(
                    result.error || `No se pudo enviar ${action} invitacion`
                )

            toast.success(`Solicitud de amistad ${action}`)
        } catch (err: unknown) {
            toast.error(`No se pudo enviar ${action} invitacion`)
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const handleProfileClick = (e: React.MouseEvent) => {
        e.preventDefault()
        
        // Check if we are on a page that supports overlay
        const isMapOrGroups = pathname?.startsWith(ROUTES.MAP) || pathname?.startsWith(ROUTES.GROUPS) || pathname?.startsWith(ROUTES.GROUP)
        
        if (isMapOrGroups) {
            const params = new URLSearchParams(searchParams.toString())
            params.set('profile', friend.username)
            router.push(`${pathname}?${params.toString()}`, { scroll: false })
        } else {
            // Redirect to map with profile param
            router.push(`${ROUTES.MAP}?profile=${friend.username}`)
        }
    }

    // Si solo se muestra la imagen (modo compacto)
    if (showOnlyImage) {
        return (
            <a
                href={`${ROUTES.MAP}?profile=${friend.username}`}
                onClick={handleProfileClick}
                className={styles.user__image_only}
            >
                <div className={styles.user__img}>
                    {friend.fotoPerfilUrl ? (
                        <Image
                            src={friend.fotoPerfilUrl}
                            alt={friend.nombre}
                            width={40}
                            height={40}
                            className={styles.user__img}
                        />
                    ) : (
                        <FontAwesomeIcon icon={faUser} />
                    )}
                </div>
            </a>
        )
    }

    return (
        <li className={`${styles.user} ${loading ? styles.loading : ''}`}>
            <a
                href={`${ROUTES.MAP}?profile=${friend.username}`}
                onClick={handleProfileClick}
                className={styles.user__link}
            >
                <div className={styles.user__img}>
                    {friend.fotoPerfilUrl ? (
                        <Image
                            src={friend.fotoPerfilUrl}
                            alt={friend.nombre}
                            width={40}
                            height={40}
                            className={styles.user__img}
                        />
                    ) : (
                        <FontAwesomeIcon icon={faUser} />
                    )}
                </div>
                <div className={styles.user__data}>
                    <p className={styles.user__name}>{friend.nombre}</p>
                    <p className={styles.user__user}>{friend.username}</p>
                </div>
            </a>
            {isSearching && (
                <div className={styles.user__info}>
                    <FontAwesomeIcon
                        icon={isInvitating ? faCircleCheck : faCirclePlus}
                        className={styles.user__icon}
                        onClick={handleAddFriend}
                    />
                </div>
            )}
            {invitationId && (
                <div className={styles.user__info}>
                    <FontAwesomeIcon
                        icon={faThumbsUp}
                        className={styles.user__icon}
                        onClick={(e) => handleAction('aceptar', e)}
                    />
                    <FontAwesomeIcon
                        icon={faThumbsDown}
                        className={styles.user__icon}
                        onClick={(e) => handleAction('rechazar', e)}
                    />
                </div>
            )}
        </li>
    )
}
