'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faCrown,
    faGear,
    faSearch,
    faUser,
    faUserPlus,
    faX,
    faUserMinus,
} from '@fortawesome/free-solid-svg-icons'
import styles from './page.module.css'
import { Group, GroupMember } from '@/types'
import { ChangeEvent, useEffect, useState } from 'react'
import { useToast } from '@/context/ToastContext'
import { inviteUserToGroup, removeGroupMember } from '@/app/actions/groups'
import Link from 'next/link'
import { ROUTES } from '@/routes'
import { ConfirmModal } from '@/components/modal/ConfirmModal'

interface Props {
    group: Group
    members: (GroupMember & { checked: boolean })[]
    onCheck: (id: string) => void
    onMemberRemoved?: (memberId: string) => void
}

export default function GroupSocial({ group, members, onCheck, onMemberRemoved }: Props) {
    const toast = useToast()

    const [filteredMembers, setFilteredMembers] = useState<GroupMember[]>([])
    const [isEditing, setIsEditing] = useState(false)
    const [memberToDelete, setMemberToDelete] = useState<GroupMember | null>(null)

    useEffect(() => {
        // Ordenar miembros: administradores primero
        const sortedMembers = [...members].sort((a, b) => {
            const aIsAdmin = a.esAdministrador ? 1 : 0
            const bIsAdmin = b.esAdministrador ? 1 : 0
            return bIsAdmin - aIsAdmin // Administradores primero (1 - 0 = 1, 0 - 1 = -1)
        })
        setFilteredMembers(sortedMembers)
    }, [group, members])

    const handleSearchMembers = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value

        if (!group) return

        const filtered = group.miembros.filter(
            m =>
                m.usuarioNombre.toLowerCase().includes(value) ||
                m.usuarioEmail.toLowerCase().includes(value)
        )

        // Ordenar: administradores primero
        const sorted = filtered.sort((a, b) => {
            const aIsAdmin = a.esAdministrador ? 1 : 0
            const bIsAdmin = b.esAdministrador ? 1 : 0
            return bIsAdmin - aIsAdmin
        })

        setFilteredMembers(sorted)
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

    const handleKickClick = (member: GroupMember) => {
        setMemberToDelete(member)
    }

    const handleKickConfirm = async () => {
        if (!memberToDelete) return

        const result = await removeGroupMember(group.id, memberToDelete.usuarioUsername)

        if (!result.success) {
            toast.error(result.error || 'Error al remover del grupo')
            setMemberToDelete(null)
            return
        }

        toast.success(`${memberToDelete.usuarioNombre} fue eliminado del grupo`)

        setFilteredMembers(prev => prev.filter(m => m.id !== memberToDelete.id))
        
        // Notificar al componente padre para actualizar el estado
        if (onMemberRemoved) {
            onMemberRemoved(memberToDelete.id)
        }

        setMemberToDelete(null)
    }

    return (
        <>
            <ConfirmModal
                isOpen={memberToDelete !== null}
                onClose={() => setMemberToDelete(null)}
                onConfirm={handleKickConfirm}
                title="Eliminar miembro"
                message={`¿Estás seguro de que deseas eliminar a ${memberToDelete?.usuarioNombre} del grupo?`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                confirmButtonStyle="danger"
            />
            <nav className={styles.social__nav}>
                <div className={styles.social__div}>
                    <h2 className={styles.social__title}>{group.nombre}</h2>
                </div>
                <div 
                    className={styles.social__div}
                    onClick={() => setIsEditing(!isEditing)}
                    style={{ cursor: 'pointer' }}
                >
                    <FontAwesomeIcon
                        icon={isEditing ? faX : faGear}
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
                                {isEditing ? (
                                    <button
                                        className={styles.member__delete_btn}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            handleKickClick(m)
                                        }}
                                        disabled={m.esAdministrador}
                                        title={m.esAdministrador ? 'No se puede eliminar al administrador' : 'Eliminar del grupo'}
                                    >
                                        <FontAwesomeIcon
                                            icon={faUserMinus}
                                            className={styles.member__delete_icon}
                                        />
                                    </button>
                                ) : (
                                    <label className={styles.member__checkbox_label}>
                                        <input
                                            type="checkbox"
                                            className={styles.filter__input}
                                            checked={isChecked}
                                            onChange={() => onCheck(m.id)}
                                        />
                                        <span className={styles.checkmark}></span>
                                    </label>
                                )}
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
