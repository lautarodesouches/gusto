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
    faTrash,
    faRightFromBracket,
    faFloppyDisk,
} from '@fortawesome/free-solid-svg-icons'
import styles from './page.module.css'
import { Group, GroupMember } from '@/types'
import { ChangeEvent, useEffect, useState } from 'react'
import { useToast } from '@/context/ToastContext'
import { inviteUserToGroup, removeGroupMember, deleteGroup, leaveGroup, updateGroupName } from '@/app/actions/groups'
import { ROUTES } from '@/routes'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ConfirmModal } from '@/components/modal/ConfirmModal'

interface Props {
    group: Group
    members: (GroupMember & { checked: boolean })[]
    onCheck: (id: string) => void
    onMemberRemoved?: (memberId: string) => void
    isAdmin: boolean
    currentUserId: string
}

export default function GroupSocial({ group, members, onCheck, onMemberRemoved, isAdmin }: Props) {
    const toast = useToast()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [filteredMembers, setFilteredMembers] = useState<GroupMember[]>([])
    const [isEditing, setIsEditing] = useState(false)
    const [memberToDelete, setMemberToDelete] = useState<GroupMember | null>(null)
    const [usuariosConectados, setUsuariosConectados] = useState<Set<string>>(new Set())
    
    // Settings State
    const [loading, setLoading] = useState(false)
    const [groupName, setGroupName] = useState(group.nombre)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

    const handleUpdateGroupName = async () => {
        if (!groupName.trim() || groupName === group.nombre) return
        
        setLoading(true)
        try {
            const result = await updateGroupName(group.id, groupName.trim())

            if (!result.success) throw new Error(result.error)

            toast.success('Nombre del grupo actualizado')
            router.refresh()
            setIsEditing(false)
        } catch (err: unknown) {
            toast.error(
                err instanceof Error ? err.message : 'Error al actualizar el nombre del grupo'
            )
            setGroupName(group.nombre)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteGroup = async () => {
        setLoading(true)
        try {
            const result = await deleteGroup(group.id)

            if (!result.success) throw new Error(result.error)

            toast.success('Grupo eliminado exitosamente')
            router.push(ROUTES.MAP)
        } catch (err: unknown) {
            toast.error(
                err instanceof Error ? err.message : 'Error al eliminar el grupo'
            )
        } finally {
            setLoading(false)
            setShowDeleteConfirm(false)
        }
    }

    const handleLeaveGroup = async () => {
        setLoading(true)
        try {
            const result = await leaveGroup(group.id)

            if (!result.success) throw new Error(result.error)

            toast.success('Has abandonado el grupo')
            router.push(ROUTES.MAP)
        } catch (err: unknown) {
            toast.error(
                err instanceof Error ? err.message : 'Error al abandonar el grupo'
            )
        } finally {
            setLoading(false)
            setShowLeaveConfirm(false)
        }
    }

    useEffect(() => {
        // Ordenar miembros: administradores primero
        const sortedMembers = [...members].sort((a, b) => {
            const aIsAdmin = a.esAdministrador ? 1 : 0
            const bIsAdmin = b.esAdministrador ? 1 : 0
            return bIsAdmin - aIsAdmin // Administradores primero (1 - 0 = 1, 0 - 1 = -1)
        })
        setFilteredMembers(sortedMembers)
    }, [group, members])

    // Escuchar eventos globales de usuarios conectados para mostrar indicadores
    useEffect(() => {
        const handler = (event: Event) => {
            const conectados = (event as CustomEvent<string[]>).detail
            if (conectados && Array.isArray(conectados)) {
                setUsuariosConectados(new Set(conectados))
            }
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('usuarios:conectados', handler as EventListener)
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('usuarios:conectados', handler as EventListener)
            }
        }
    }, [])

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
                    {isEditing && isAdmin ? (
                        <div className={styles.nameEditor}>
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                className={styles.nameInput}
                                maxLength={50}
                            />
                            <button
                                onClick={handleUpdateGroupName}
                                disabled={loading || !groupName.trim() || groupName === group.nombre}
                                className={styles.saveButton}
                            >
                                <FontAwesomeIcon icon={faFloppyDisk} />
                            </button>
                        </div>
                    ) : (
                        <h2 className={styles.social__title}>{group.nombre}</h2>
                    )}
                </div>

                {/* Solo el administrador puede ver y usar la rueda de configuración */}
                {isAdmin && (
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
                )}
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
                            <a
                                href={`${pathname}?profile=${m.usuarioUsername}`}
                                onClick={(e) => {
                                    e.preventDefault()
                                    const params = new URLSearchParams(searchParams.toString())
                                    params.set('profile', m.usuarioUsername)
                                    router.push(`${pathname}?${params.toString()}`, { scroll: false })
                                }}
                                className={styles.member__link}
                            >
                                <div className={styles.member__div}>
                                    {/* Indicador de conexión */}
                                    <span
                                        className={`${styles.member__status} ${
                                            usuariosConectados.has(m.usuarioFirebaseUid)
                                                ? styles.member__status_online
                                                : styles.member__status_offline
                                        }`}
                                        title={
                                            usuariosConectados.has(m.usuarioFirebaseUid)
                                                ? 'En línea'
                                                : 'Desconectado'
                                        }
                                    />
                                    {m.fotoPerfilUrl ? (
                                        <img
                                            src={m.fotoPerfilUrl}
                                            className={styles.member__img}
                                            alt={m.usuarioNombre}
                                            width={40}
                                            height={40}
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
                            </a>
                            <div className={styles.member__div}>
                                {/* Solo el administrador puede ver checkboxes y botón de eliminar */}
                                {isAdmin && (
                                    isEditing ? (
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
                                    )
                                )}
                            </div>
                        </article>
                    )
                })}
            </div>

            {/* Solo el administrador puede invitar nuevos miembros */}
            {isAdmin && (
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
            )}

            {/* Botón de abandonar grupo para usuarios no admin (siempre visible) */}
            {!isAdmin && (
                <div className={styles.leaveGroupContainer}>
                    <button
                        onClick={() => setShowLeaveConfirm(true)}
                        className={styles.leaveGroupButton}
                        disabled={loading}
                    >
                        <FontAwesomeIcon icon={faRightFromBracket} />
                        Abandonar Grupo
                    </button>
                </div>
            )}

            {isEditing && (
                <div className={styles.dangerZone}>
                    {isAdmin && (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className={`${styles.dangerButton} ${styles.delete}`}
                            disabled={loading}
                        >
                            <FontAwesomeIcon icon={faTrash} />
                            Eliminar Grupo
                        </button>
                    )}
                </div>
            )}

            {/* Modals */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteGroup}
                title="¿Eliminar grupo?"
                message="Esta acción es permanente. Se eliminará todo el contenido del grupo y todos los miembros perderán acceso."
                confirmText={loading ? 'Eliminando...' : 'Eliminar Grupo'}
                cancelText="Cancelar"
                confirmButtonStyle="danger"
            />

            <ConfirmModal
                isOpen={showLeaveConfirm}
                onClose={() => setShowLeaveConfirm(false)}
                onConfirm={handleLeaveGroup}
                title="¿Abandonar grupo?"
                message="Perderás acceso a todo el contenido del grupo. Necesitarás una nueva invitación para volver a unirte."
                confirmText={loading ? 'Abandonando...' : 'Abandonar'}
                cancelText="Cancelar"
                confirmButtonStyle="danger"
            />
        </>
    )
}
