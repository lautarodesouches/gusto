'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faCrown,
    faGear,
    faSearch,
    faUser,
    faUserPlus,
} from '@fortawesome/free-solid-svg-icons'
import styles from './page.module.css'
import { Group, GroupMember } from '@/types'
import { ChangeEvent, useEffect, useState } from 'react'
import { useToast } from '@/context/ToastContext'
import { inviteUserToGroup } from '@/app/actions/groups'
import Link from 'next/link'
import { ROUTES } from '@/routes'

interface Props {
    group: Group
    members: (GroupMember & { checked: boolean })[]
    onCheck: (id: string) => void
}

export default function GroupSocial({ group, members, onCheck }: Props) {
    const toast = useToast()

    const [filteredMembers, setFilteredMembers] = useState<GroupMember[]>([])

    useEffect(() => {
        setFilteredMembers(members)
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

    return (
        <>
            <nav className={styles.social__nav}>
                <div className={styles.social__div}>
                    <h2 className={styles.social__title}>{group.nombre}</h2>
                </div>
                <div className={styles.social__div}>
                    <FontAwesomeIcon
                        icon={faGear}
                        className={styles.social__icon}
                    />
                </div>
            </nav>
            <fieldset className={styles.search}>
                <FontAwesomeIcon
                    icon={faSearch}
                    className={styles.search__icon}
                />
                <input
                    className={styles.search__input}
                    type="text"
                    placeholder="Buscar integrante"
                    onChange={handleSearchMembers}
                />
            </fieldset>
            <div className={styles.members}>
                {filteredMembers.length === 0 && (
                    <p className={styles.members__error}>
                        No se encontraron miembros
                    </p>
                )}
                {filteredMembers.map(m => {
                    const realMember = members.find(e => e.id === m.id)
                    const isChecked = realMember?.checked ?? false
                    return (
                        <article className={styles.member} key={m.id}>
                            <Link
                                href={`${ROUTES.PROFILE}${m.usuarioUsername}`}
                                className={styles.member__link}
                            >
                                <div className={styles.member__div}>
                                    {[
                                        'juanperez',
                                        'carlossanchesz',
                                        'luciagomez',
                                        'mariasosa',
                                    ].includes(m.usuarioUsername?.toLowerCase()) ? (
                                        <img
                                            src={`/users/${m.usuarioNombre
                                                .split(' ')[0]
                                                .toLowerCase()}.jpg`}
                                            className={styles.member__img}
                                            alt={m.usuarioNombre}
                                        />
                                    ) : (
                                        <FontAwesomeIcon
                                            icon={faUser}
                                            className={styles.member__svg}
                                        />
                                    )}
                                </div>
                                <div className={styles.member__div}>
                                    <h3 className={styles.member__name}>
                                        {m.usuarioNombre}
                                        {m.esAdministrador && (
                                            <FontAwesomeIcon
                                                icon={faCrown}
                                                className={styles.member__crown}
                                            />
                                        )}
                                    </h3>
                                </div>
                            </Link>
                            <div className={styles.member__div}>
                                <label className={styles.member__checkbox_label}>
                                    <input
                                        type="checkbox"
                                        className={styles.filter__input}
                                        checked={isChecked}
                                        onChange={() => onCheck(m.id)}
                                    />
                                    <span className={styles.checkmark}></span>
                                </label>
                            </div>
                        </article>
                    )
                })}
            </div>
            <form className={styles.invite} onSubmit={handleInvite}>
                <fieldset className={styles.invite__fieldset}>
                    <FontAwesomeIcon
                        className={styles.invite__icon}
                        icon={faUserPlus}
                    />
                    <input
                        className={styles.invite__input}
                        type="text"
                        name="email"
                        placeholder="Email del usuario"
                        required
                    />
                </fieldset>
                <div className={styles.invite__div}>
                    <button className={styles.invite__button}>Agregar</button>
                </div>
            </form>
        </>
    )
}
