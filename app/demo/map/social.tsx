'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './page.module.css'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import { Friend, FriendInvitation, Group } from '@/types'
import FriendCard from '@/components/Social/FriendCard'
import FriendSearch from '@/components/Social/FriendSearch'
import GroupCreate from '@/components/Social/GroupCreate'
import { GroupCard } from '@/components'

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

export default function Social() {
    const [friends, setFriends] = useState<Friend[]>([])
    const [friendsInvitations, setFriendsInvitations] = useState<
        FriendInvitation[]
    >([])
    const [groups, setGroups] = useState<Group[]>([])

    const [showSearchFriend, setShowSearchFriend] = useState(false)
    const [showNewGroup, setShowNewGroup] = useState(false)

    const getFriends = async () => {
        setFriends([
            {
                id: 'f001',
                nombre: 'Lucas Pérez',
                email: 'lucas.perez@example.com',
                fotoPerfilUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
            },
            {
                id: 'f002',
                nombre: 'Mariana Gómez',
                email: 'mariana.gomez@example.com',
                fotoPerfilUrl:
                    'https://randomuser.me/api/portraits/women/45.jpg',
            },
        ])
    }

    const getFriendRequests = async () => {
        setFriendsInvitations([
            {
                id: 'inv001',
                remitente: {
                    id: 'f001',
                    nombre: 'Gusto!',
                    email: 'lucas.perez@example.com',
                    fotoPerfilUrl:
                        'https://randomuser.me/api/portraits/men/32.jpg',
                },
                destinatario: {
                    id: 'f002',
                    nombre: 'Mariana Gómez',
                    email: 'mariana.gomez@example.com',
                    fotoPerfilUrl:
                        'https://randomuser.me/api/portraits/women/45.jpg',
                },
                estado: 'Pendiente',
                fechaEnvio: '2025-10-15T03:55:36.3645466',
                fechaRespuesta: null,
                mensaje: null,
            },
        ])
    }

    const getGroups = async () => {
        setGroups([
            {
                activo: true,
                administradorFirebaseUid: 'uid_admin_001',
                administradorId: 'f001',
                administradorNombre: 'Lucas Pérez',
                cantidadMiembros: 3,
                codigoInvitacion: 'GRP12345',
                descripcion: 'Grupo de amigos para planear salidas y eventos.',
                fechaCreacion: '2025-10-20T12:00:00.000Z',
                fechaExpiracionCodigo: '2025-11-20T12:00:00.000Z',
                id: 'g001',
                miembros: [
                    {
                        usuarioEmail: 'lucas.perez@example.com',
                        usuarioNombre: 'Lucas Pérez',
                        id: 'f001',
                    },
                    {
                        usuarioEmail: 'mariana.gomez@example.com',
                        usuarioNombre: 'Mariana Gómez',
                        id: 'f002',
                    },
                    {
                        usuarioEmail: 'sofia.ramos@example.com',
                        usuarioNombre: 'Sofía Ramos',
                        id: 'f003',
                    },
                ],
                nombre: 'Amigos Salidas',
            },
            {
                activo: true,
                administradorFirebaseUid: 'uid_admin_002',
                administradorId: 'f002',
                administradorNombre: 'Mariana Gómez',
                cantidadMiembros: 2,
                codigoInvitacion: 'GRP67890',
                descripcion: 'Grupo para organizar viajes y excursiones.',
                fechaCreacion: '2025-10-18T09:30:00.000Z',
                fechaExpiracionCodigo: '2025-11-18T09:30:00.000Z',
                id: 'g002',
                miembros: [
                    {
                        usuarioEmail: 'mariana.gomez@example.com',
                        usuarioNombre: 'Mariana Gómez',
                        id: 'f002',
                    },
                    {
                        usuarioEmail: 'lucas.perez@example.com',
                        usuarioNombre: 'Lucas Pérez',
                        id: 'f001',
                    },
                ],
                nombre: 'Viajes y Aventuras',
            },
        ])
    }

    useEffect(() => {
        getFriends()
        getFriendRequests()
        getGroups()
    }, [])

    return (
        <section className={`${styles.social} ${true ? styles.show : ''}`}>
            {showSearchFriend && <FriendSearch />}
            {showNewGroup && (
                <GroupCreate
                    handleCancel={() => {
                        setShowNewGroup(false)
                    }}
                />
            )}
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
                            <GroupCard key={g.id} group={g} />
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
