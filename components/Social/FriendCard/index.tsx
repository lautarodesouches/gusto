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
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/routes'
import Link from 'next/link'

export default function FriendCard({
    friend,
    isSearching,
    invitationId,
}: {
    friend: Friend
    isSearching?: boolean
    invitationId?: string
}) {
    const router = useRouter()

    const [loading, setLoading] = useState(false)
    const [isInvitating, setIsInvitating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleAddFriend = async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/social/friend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ EmailDestino: friend.email }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data?.error || 'Error al enviar solicitud')
            }

            setIsInvitating(true)
            alert('Invitacion enviada')
        } catch (err: unknown) {
            console.error(err)
            if (err instanceof Error)
                setError(err.message || 'Error desconocido')
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (action: 'aceptar' | 'rechazar') => {
        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/social/friend-invitation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ solicitudId: invitationId, action }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Error desconocido')

            alert('Solicitud ' + action)
            router.refresh()
        } catch (err: unknown) {
            console.error(err)
            if (err instanceof Error) {
                setError(err.message || 'Error desconocido')
                alert(err.message)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <li className={`${styles.user} ${loading ? styles.loading : ''}`}>
            <div className={styles.user__img}>
                <FontAwesomeIcon icon={faUser} />
            </div>
            <div className={styles.user__data}>
                <p className={styles.user__name}>{friend.nombre}</p>
                <p className={styles.user__user}>
                    {friend.nombre.replaceAll(' ', '').toLowerCase()}
                </p>
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
