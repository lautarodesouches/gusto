'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './page.module.css'
import {
    faArrowRightToBracket,
    faClose,
    faPlus,
    faUser,
} from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import { Friend, FriendInvitation } from '@/types'
import FriendCard from '@/components/Social/FriendCard'
import FriendSearch from '@/components/Social/FriendSearch'
import GroupCreate from '@/components/Social/GroupCreate'

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
    const [groups, setGroups] = useState<Friend[]>([])

    const [showSearchFriend, setShowSearchFriend] = useState(false)
    const [showNewGroup, setShowNewGroup] = useState(false)

    const getFriends = async () => {
        try {
            const res = await fetch(`/api/social?endpoint=Amistad/amigos`)
            if (!res.ok) throw new Error('Error al cargar amigos')
            const data = await res.json()
            setFriends(data)
        } catch (err) {
            console.error(err)
        }
    }

    const getFriendRequests = async () => {
        try {
            const res = await fetch(`/api/social?endpoint=Amistad/solicitudes`)
            if (!res.ok)
                throw new Error('Error al cargar invitaciones de amigos')
            const data = await res.json()
            console.log(data)
            setFriendsInvitations(data)
        } catch (err) {
            console.error(err)
        }
    }

    const getGroups = async () => {
        try {
            const res = await fetch(`/api/social?endpoint=Grupo/mis-grupos`)
            if (!res.ok) throw new Error('Error al cargar grupos')
            const data = await res.json()
            setGroups(data)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        getFriends()
        getFriendRequests()
        getGroups()
    }, [])

    return (
        <section className={`${styles.social} ${isVisible ? styles.show : ''}`}>
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
            {showSearchFriend && <FriendSearch />}
            {showNewGroup && <GroupCreate />}
            <div className={styles.social__content}>
                <div className={styles.social__buttons}>
                    <FriendButton
                        handleClick={() =>
                            setShowSearchFriend(!showSearchFriend)
                        }
                    />
                    <GroupButton
                        handleClick={() => setShowNewGroup(!showNewGroup)}
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
                        handleClick={() =>
                            setShowSearchFriend(!showSearchFriend)
                        }
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
                        {groups.map(g => (
                            <li className={styles.group} key={g.name}>
                                <div className={styles.group__img}>
                                    <FontAwesomeIcon icon={faUser} />
                                </div>
                                <div className={styles.group__data}>
                                    <p className={styles.group__name}>
                                        {g.name}
                                    </p>
                                    <p className={styles.group__number}>
                                        {g.numberOfMembers}
                                    </p>
                                </div>
                            </li>
                        ))}
                        <GroupButton
                            handleClick={() => setShowNewGroup(!showNewGroup)}
                        />
                    </ul>
                </div>
            </div>
        </section>
    )
}
