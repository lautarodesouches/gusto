'use client'
import styles from './styles.module.css'
import { Group } from '@/types'
import GroupSocial from '../Social'
import Footer from '../Footer'
import { useCallback, useState } from 'react'
import GroupComponent from '../Group'
import { useAuth } from '@/context/AuthContext'
import Switch from '../Switch'
import { activateGroupMember, deactivateGroupMember } from '@/app/actions/groups'
import { useToast } from '@/context/ToastContext'

export type ActiveView = 'home' | 'chat' | 'map'

interface Props {
    group: Group
}

export default function GroupClient({ group }: Props) {
    const auth = useAuth()
    const toast = useToast()

    const [activeView, setActiveView] = useState<ActiveView>('home')
    const [mobileView, setMobileView] = useState<'social' | 'group'>('social')

    const [members, setMembers] = useState(
        group.miembros.map(m => ({ ...m, checked: true }))
    )

    const handleToggleCheck = async (id: string) => {
        const member = members.find(m => m.id === id)
        if (!member) return

        const isCurrentlyChecked = member.checked
        const newCheckedState = !isCurrentlyChecked

        // Optimistic update
        setMembers(prev =>
            prev.map(m => (m.id === id ? { ...m, checked: newCheckedState } : m))
        )

        // Call backend action
        const result = newCheckedState
            ? await activateGroupMember(group.id, member.usuarioId)
            : await deactivateGroupMember(group.id, member.usuarioId)

        if (!result.success) {
            // Revert on error
            setMembers(prev =>
                prev.map(m => (m.id === id ? { ...m, checked: isCurrentlyChecked } : m))
            )
            toast.error(result.error || 'Error al actualizar el estado del miembro')
        } else {
            toast.success(
                newCheckedState
                    ? `${member.usuarioNombre} activado`
                    : `${member.usuarioNombre} desactivado`
            )
        }
    }

    const handleChangeView = useCallback((view: ActiveView) => {
        setActiveView(view)
        if (view === 'home') {
            setMobileView('social')
        } else {
            setMobileView('group')
        }
    }, [])

    return (
        <>
            <Switch 
                activeView={activeView} 
                onClick={handleChangeView}
                hideOnMobileHome={true}
            />
            <section className={styles.content}>
                <div
                    className={`${styles.content__social} ${
                        mobileView === 'social' ? styles.active : ''
                    }`}
                >
                    <GroupSocial
                        members={members}
                        group={group}
                        onCheck={handleToggleCheck}
                    />
                </div>
                <div
                    className={`${styles.content__group} ${
                        mobileView === 'group' ? styles.active : ''
                    }`}
                >
                    <GroupComponent
                        admin={auth.user?.email || ''}
                        activeView={activeView}
                        groupId={group.id}
                        members={members}
                        onClick={handleChangeView}
                    />
                </div>
            </section>
            <Footer activeView={activeView} onClick={handleChangeView} />
        </>
    )
}
