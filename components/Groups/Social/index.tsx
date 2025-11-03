'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faCrown,
    faGear,
    faInfo,
    faSearch,
    faUser,
    faUserPlus,
    faUserXmark,
} from '@fortawesome/free-solid-svg-icons'
import styles from './page.module.css'
import { Group, GroupMember } from '@/types'
import { ChangeEvent, useEffect, useState } from 'react'
import { useToast } from '@/context/ToastContext'
import { inviteUserToGroup, removeGroupMember } from '@/app/actions/groups'

interface Props {
    group: Group
}

export default function GroupsSocial({ group }: Props) {
    const toast = useToast()

    const [filteredMembers, setFilteredMembers] = useState<GroupMember[]>([])

    useEffect(() => {
        setFilteredMembers(group.miembros)
    }, [group])

    const handleSearchMembers = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value

        if (!group) return

        const filtered = group.miembros.filter(
            m =>
                m.usuarioNombre.toLowerCase().includes(value) ||
                m.usuarioEmail.toLowerCase().includes(value)
        )

        setFilteredMembers(filtered)
    }

    const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)

        const email = formData.get('email') as string

        if (!email) return toast.error('Ingrese un email')

        const message = `Te invito a formar parte de ${group.nombre}`

        const result = await inviteUserToGroup(group.id, email, message)

        if (!result.success)
            return toast.error(result.error || 'Error al invitar al grupo')

        toast.success('Invitación enviada')

        setFilteredMembers(prev => [...prev])
    }

    const handleKick = async (memberId: string) => {
        const result = await removeGroupMember(group.id, memberId)

        if (!result.success)
            return toast.error(result.error || 'Error al remover del grupo')

        toast.success('Usuario eliminado del grupo')

        setFilteredMembers(prev => prev.filter(m => m.id !== memberId))
    }

    return (
        <>
            <div className={styles.container}>
                <section className={styles.social}>
                    <nav className={styles.social__nav}>
                        <div className={styles.social__div}>
                            <h2 className={styles.social__title}>
                                {group.nombre}
                            </h2>
                        </div>
                        <div className={styles.social__div}>
                            <FontAwesomeIcon
                                icon={faGear}
                                className={styles.social__icon}
                            />
                        </div>
                    </nav>
                    <div className={styles.search}>
                        <FontAwesomeIcon
                            icon={faSearch}
                            className={styles.search__icon}
                        />
                        <input type="text" onChange={handleSearchMembers} />
                    </div>
                    <div className={styles.members}>
                        {filteredMembers.length === 0 && (
                            <p className={styles.members__error}>
                                No se encontraron miembros
                            </p>
                        )}
                        {filteredMembers.map(m => (
                            <article className={styles.member} key={m.id}>
                                <div className={styles.member__div}>
                                    <FontAwesomeIcon
                                        icon={faUser}
                                        className={styles.member__img}
                                    />
                                </div>
                                <div className={styles.member__div}>
                                    <h3 className={styles.member__name}>
                                        {m.usuarioNombre}
                                    </h3>
                                    {m.id === group.administradorId && (
                                        <FontAwesomeIcon
                                            icon={faCrown}
                                            className={styles.member__crown}
                                        />
                                    )}
                                </div>
                                <div className={styles.member__div}>
                                    <FontAwesomeIcon
                                        icon={faInfo}
                                        className={styles.members__icon}
                                    />
                                    <FontAwesomeIcon
                                        icon={faUserXmark}
                                        className={styles.members__icon}
                                        onClick={() => handleKick(m.id)}
                                    />
                                </div>
                            </article>
                        ))}
                    </div>
                    <form className={styles.invite} onSubmit={handleInvite}>
                        <div>
                            <FontAwesomeIcon
                                icon={faUserPlus}
                                className={styles.invite__icon}
                            />
                            <input
                                type="text"
                                placeholder="Email del usuario"
                            />
                        </div>
                        <div>
                            <button>Agregar</button>
                        </div>
                    </form>
                    <footer className={styles.footer}>
                        <button>Inicio</button>
                        <button>Grupo</button>
                    </footer>
                </section>
            </div>
        </>
    )
}
