'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './page.module.css'
import {
    faArrowRightToBracket,
    faClose,
    faPlus,
} from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import { Friend, FriendInvitation, Group } from '@/types'
import FriendCard from '@/components/Social/FriendCard'
import FriendSearch from '@/components/Social/FriendSearch'
import GroupCreate from '@/components/Social/GroupCreate'
import { GroupCard } from '@/components'

interface Props {
    isVisible: boolean
    handleClose: () => void
}

const FriendButton = ({ handleClick }: { handleClick: () => void }) => (
    <button className={styles.social__button} onClick={handleClick}>
        <FontAwesomeIcon icon={faPlus} />
        Añadir amigo
    </button>
)

const GroupButton = ({ handleClick }: { handleClick: () => void }) => (
    <button className={styles.social__button} onClick={handleClick}>
        <FontAwesomeIcon icon={faPlus} />
        Crear grupo
    </button>
)

export default function Social({ isVisible, handleClose }: Props) {
    const [friends, setFriends] = useState<Friend[]>([])
    const [friendsInvitations, setFriendsInvitations] = useState<
        FriendInvitation[]
    >([])
    const [groups, setGroups] = useState<Group[]>([])

    const [showSearchFriend, setShowSearchFriend] = useState(false)
    const [showNewGroup, setShowNewGroup] = useState(false)

    const getFriends = async () => {
        try {
            const res = await fetch('/api/social?endpoint=Amistad/amigos')

            if (!res.ok) {
                throw new Error(`Error ${res.status}: ${res.statusText}`)
            }

            const data: Friend[] = await res.json()

            setFriends(data)
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Error desconocido'
            console.error('Error al cargar amigos:', errorMessage)
            setFriends([])
        }
    }

    const getFriendRequests = async () => {
        try {
            const res = await fetch('/api/social?endpoint=Amistad/solicitudes')

            if (!res.ok) {
                throw new Error(`Error ${res.status}: ${res.statusText}`)
            }

            const data: FriendInvitation[] = await res.json()
            setFriendsInvitations(data)
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Error desconocido'
            console.error('Error al cargar solicitudes:', errorMessage)
            setFriendsInvitations([])
        }
    }

    const getGroups = async () => {
        try {
            const res = await fetch(`/api/social?endpoint=Grupo/mis-grupos`)
           
              if (!res.ok) {
                throw new Error(`Error ${res.status}: ${res.statusText}`)
            }

                 const data: Group[] = await res.json()

           setGroups(Array.isArray(data) ? data : []);

      setGroups(Array.isArray(data) ? data : []);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Error desconocido'
            console.error('Error al cargar grupos:', errorMessage)
            setGroups([])
        }
    }
    useEffect(() => {
        getFriends()
        getFriendRequests()
        getGroups()
    }, [])

    return (
        <>
            {showSearchFriend && <FriendSearch />}
            {showNewGroup && (
                <GroupCreate
                    handleCancel={() => {
                        setShowNewGroup(false)
                    }}
                />
            )}
            <section
                className={`${styles.social} ${isVisible ? styles.show : ''}`}
            >
                <header className={styles.social__header}>
                    <h2 className={styles.social__title}>Social</h2>
                    <FontAwesomeIcon
                        icon={faClose}
                        className={styles.social__close}
                        onClick={handleClose}
                    />
                    <div className={styles.social__width}>
                        <FontAwesomeIcon icon={faArrowRightToBracket} />
                        <p>Contraer pestaña</p>
                    </div>
                </header>
                <div className={styles.social__content}>
                    <div className={styles.social__buttons}>
                        <FriendButton
                            handleClick={() => {
                                setShowSearchFriend(!showSearchFriend)
                                setShowNewGroup(false)
                            }}
                        />
                        <GroupButton
                            handleClick={() => {
                                setShowNewGroup(!showNewGroup)
                                setShowSearchFriend(false)
                            }}
                        />
                    </div>
                    <div className={styles.social__div}>
                        <h3 className={styles.social__description}>Amigos</h3>
                        <hr className={styles.social__line} />
                        <ul className={styles.social__list}>
                            {friends.map(f => (
                                <FriendCard friend={f} key={f.id} />
                            ))}
                        </ul>
                        <FriendButton
                            handleClick={() => {
                                setShowSearchFriend(!showSearchFriend)
                                setShowNewGroup(false)
                            }}
                        />
                    </div>
                    {friendsInvitations.length > 0 && (
                        <div className={styles.social__div}>
                            <h3 className={styles.social__description}>
                                Invitaciones
                            </h3>
                            <hr className={styles.social__line} />
                            <ul className={styles.social__list}>
                                {friendsInvitations.map(i => (
                                    <FriendCard
                                        friend={i.remitente}
                                        key={i.id}
                                        invitationId={i.id}
                                    />
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className={styles.social__div}>
                        <h3 className={styles.social__description}>Grupos</h3>
                        <hr className={styles.social__line} />
                        <ul className={styles.social__list}>
                              {Array.isArray(groups) && groups.map(g => (
                                <GroupCard key={g.id} group={g} />
                            ))}
                            <GroupButton
                                handleClick={() => {
                                    setShowNewGroup(!showNewGroup)
                                    setShowSearchFriend(false)
                                }}
                            />
                        </ul>
                    </div>
                </div>
            </section>
        </>
    )
}
