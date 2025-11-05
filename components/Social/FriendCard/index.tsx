'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './page.module.css'
import { Friend } from '@/types'
import {
    faCircleCheck,
    faCirclePlus,
    faInfo,
    faThumbsDown,
    faThumbsUp,
    faUser,
} from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import { ROUTES } from '@/routes'
import Link from 'next/link'
import { addFriend, respondToFriendInvitation } from '@/app/actions/friends'
import { useToast } from '@/context/ToastContext'

export default function FriendCard({
    friend,
    isSearching,
    invitationId,
}: {
    friend: Friend
    isSearching?: boolean
    invitationId?: string
}) {
    const toast = useToast()

    const [loading, setLoading] = useState(false)
    const [isInvitating, setIsInvitating] = useState(false)

    const handleAddFriend = async () => {
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
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (action: 'aceptar' | 'rechazar') => {
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

    return (
        <li className={`${styles.user} ${loading ? styles.loading : ''}`}>
            <div className={styles.user__img}>
                {friend.fotoPerfilUrl ? (
                    <img src={friend.fotoPerfilUrl} alt={friend.nombre} />
                ) : (
                    <FontAwesomeIcon icon={faUser} />
                )}
            </div>
            <div className={styles.user__data}>
                <p className={styles.user__name}>{friend.nombre}</p>
                <p className={styles.user__user}>{friend.username}</p>
            </div>
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
                        onClick={() => handleAction('aceptar')}
                    />
                    <FontAwesomeIcon
                        icon={faThumbsDown}
                        className={styles.user__icon}
                        onClick={() => handleAction('rechazar')}
                    />
                </div>
            )}
            {!invitationId && (
                <div className={styles.user__info}>
                    <Link href={`${ROUTES.PROFILE}${friend.username}`}>
                        <FontAwesomeIcon
                            icon={faInfo}
                            className={styles.user__icon}
                        />
                    </Link>
                </div>
            )}
        </li>
    )
}
