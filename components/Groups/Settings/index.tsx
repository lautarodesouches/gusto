'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Group } from '@/types'
import { useToast } from '@/context/ToastContext'
import { ROUTES } from '@/routes'
import styles from './styles.module.css'

interface Props {
    group: Group
    isAdmin: boolean
    userId: string
}

export default function GroupSettings({ group, isAdmin, userId }: Props) {
    const router = useRouter()
    const toast = useToast()
    const [loading, setLoading] = useState(false)
    const [groupName, setGroupName] = useState(group.nombre)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
    const [memberToRemove, setMemberToRemove] = useState<{ id: string; username: string } | null>(null)

    const handleUpdateGroupName = async () => {
        if (!groupName.trim() || groupName === group.nombre) return
        
        setLoading(true)
        try {
            const res = await fetch(`/api/group/${group.id}/update-name`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: groupName.trim() })
            })

            if (!res.ok) throw new Error('Error al actualizar el nombre')

            toast.success('Nombre del grupo actualizado')
            router.refresh()
        } catch (error) {
            toast.error('Error al actualizar el nombre del grupo')
            setGroupName(group.nombre)
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveMember = async (username: string) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/group/${group.id}/remove-member`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            })

            if (!res.ok) throw new Error('Error al eliminar miembro')

            toast.success('Miembro eliminado del grupo')
            setMemberToRemove(null)
            router.refresh()
        } catch (error) {
            toast.error('Error al eliminar miembro del grupo')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteGroup = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/group/${group.id}`, {
                method: 'DELETE'
            })

            if (!res.ok) throw new Error('Error al eliminar grupo')

            toast.success('Grupo eliminado exitosamente')
            router.push(ROUTES.MAP)
        } catch (error) {
            toast.error('Error al eliminar el grupo')
        } finally {
            setLoading(false)
            setShowDeleteConfirm(false)
        }
    }

    const handleLeaveGroup = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/group/${group.id}/leave`, {
                method: 'POST'
            })

            if (!res.ok) throw new Error('Error al abandonar grupo')

            toast.success('Has abandonado el grupo')
            router.push(ROUTES.MAP)
        } catch (error) {
            toast.error('Error al abandonar el grupo')
        } finally {
            setLoading(false)
            setShowLeaveConfirm(false)
        }
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <button 
                    className={styles.backButton}
                    onClick={() => router.push(`${ROUTES.GROUP}${group.id}`)}
                >
                    ← Volver
                </button>
                <h1 className={styles.title}>Configuración del Grupo</h1>
            </div>

            {/* Editar nombre del grupo */}
            {isAdmin && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Nombre del Grupo</h2>
                    <div className={styles.nameEditor}>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className={styles.input}
                            maxLength={50}
                        />
                        <button
                            onClick={handleUpdateGroupName}
                            disabled={loading || !groupName.trim() || groupName === group.nombre}
                            className={styles.btnPrimary}
                        >
                            Guardar
                        </button>
                    </div>
                </section>
            )}

            {/* Lista de miembros */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    Miembros ({group.miembros.length})
                </h2>
                <div className={styles.memberList}>
                    {group.miembros.map((member) => (
                        <div key={member.id} className={styles.memberCard}>
                            <div className={styles.memberInfo}>
                                {member.usuarioFoto ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        src={member.usuarioFoto}
                                        alt={member.usuarioNombre}
                                        className={styles.memberAvatar}
                                        width={48}
                                        height={48}
                                    />
                                ) : (
                                    <div className={styles.memberAvatarPlaceholder}>
                                        {member.usuarioNombre[0]}
                                    </div>
                                )}
                                <div className={styles.memberDetails}>
                                    <span className={styles.memberName}>
                                        {member.usuarioNombre}
                                    </span>
                                    {member.usuarioFirebaseUid === group.administradorFirebaseUid && (
                                        <span className={styles.adminBadge}>Admin</span>
                                    )}
                                </div>
                            </div>
                            {isAdmin && member.usuarioFirebaseUid !== group.administradorFirebaseUid && (
                                <button
                                    onClick={() => setMemberToRemove({ id: member.id, username: member.usuarioUsername })}
                                    className={styles.btnDanger}
                                    disabled={loading}
                                >
                                    Eliminar
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Acciones peligrosas */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Zona de Peligro</h2>
                <div className={styles.dangerZone}>
                    {!isAdmin && (
                        <div className={styles.dangerAction}>
                            <div>
                                <h3 className={styles.dangerTitle}>Abandonar Grupo</h3>
                                <p className={styles.dangerDescription}>
                                    Saldrás del grupo y perderás acceso a todo su contenido
                                </p>
                            </div>
                            <button
                                onClick={() => setShowLeaveConfirm(true)}
                                className={styles.btnDangerOutline}
                                disabled={loading}
                            >
                                Abandonar
                            </button>
                        </div>
                    )}
                    {isAdmin && (
                        <div className={styles.dangerAction}>
                            <div>
                                <h3 className={styles.dangerTitle}>Eliminar Grupo</h3>
                                <p className={styles.dangerDescription}>
                                    Esta acción es permanente y eliminará todo el contenido del grupo
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className={styles.btnDangerSolid}
                                disabled={loading}
                            >
                                Eliminar Grupo
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Modal de confirmación para eliminar miembro */}
            {memberToRemove && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3 className={styles.modalTitle}>¿Eliminar miembro?</h3>
                        <p className={styles.modalDescription}>
                            ¿Estás seguro de que deseas eliminar a este miembro del grupo?
                        </p>
                        <div className={styles.modalActions}>
                            <button
                                onClick={() => setMemberToRemove(null)}
                                className={styles.btnSecondary}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleRemoveMember(memberToRemove.username)}
                                className={styles.btnDangerSolid}
                                disabled={loading}
                            >
                                {loading ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para eliminar grupo */}
            {showDeleteConfirm && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3 className={styles.modalTitle}>¿Eliminar grupo?</h3>
                        <p className={styles.modalDescription}>
                            Esta acción es permanente. Se eliminará todo el contenido del grupo
                            y todos los miembros perderán acceso.
                        </p>
                        <div className={styles.modalActions}>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className={styles.btnSecondary}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteGroup}
                                className={styles.btnDangerSolid}
                                disabled={loading}
                            >
                                {loading ? 'Eliminando...' : 'Eliminar Grupo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para abandonar grupo */}
            {showLeaveConfirm && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3 className={styles.modalTitle}>¿Abandonar grupo?</h3>
                        <p className={styles.modalDescription}>
                            Perderás acceso a todo el contenido del grupo. Necesitarás
                            una nueva invitación para volver a unirte.
                        </p>
                        <div className={styles.modalActions}>
                            <button
                                onClick={() => setShowLeaveConfirm(false)}
                                className={styles.btnSecondary}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleLeaveGroup}
                                className={styles.btnDangerSolid}
                                disabled={loading}
                            >
                                {loading ? 'Abandonando...' : 'Abandonar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
