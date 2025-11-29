'use client'
import styles from './styles.module.css'
import { Group } from '@/types'
import GroupSocial from '../Social'
import Footer from '../Footer'
import { useCallback, useEffect, useState } from 'react'
import GroupComponent from '../Group'
import { useAuth } from '@/context/AuthContext'
import Switch from '../Switch'
import { activateGroupMember, deactivateGroupMember } from '@/app/actions/groups'
import { useToast } from '@/context/ToastContext'
import { Restaurant } from '@/types'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/routes'

export type ActiveView = 'home' | 'chat' | 'map' | 'vote'

interface Props {
    group: Group
}

export default function GroupClient({ group }: Props) {
    const auth = useAuth()
    const toast = useToast()
    const router = useRouter()

    const [activeView, setActiveView] = useState<ActiveView>('home')
    const [mobileView, setMobileView] = useState<'social' | 'group'>('social')
    const [currentRestaurants, setCurrentRestaurants] = useState<Restaurant[]>([])
    const [kickedInfo, setKickedInfo] = useState<{ grupoId: string; nombreGrupo: string } | null>(null)

    const [members, setMembers] = useState(
        group.miembros.map(m => ({ ...m, checked: true }))
    )
    
    // Verificar si el usuario actual es administrador
    const isAdmin = auth.user?.uid === group.administradorFirebaseUid

    // Escuchar eventos globales de actualización de grupos para refrescar
    // el grupo actual (miembros, etc.) en tiempo real.
    useEffect(() => {
        const handler = () => {
            router.refresh()
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('groups:refresh', handler)
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('groups:refresh', handler)
            }
        }
    }, [router])

    // Mantener sincronizada la lista de miembros local con la que viene del backend
    // cuando el grupo se refresca.
    useEffect(() => {
        setMembers(prev => {
            const prevById = new Map(prev.map(m => [m.id, m]))

            return group.miembros.map(m => {
                const prevMember = prevById.get(m.id)
                return {
                    ...m,
                    checked: prevMember?.checked ?? true,
                }
            })
        })
    }, [group])

    // Escuchar evento global "group:kicked" para bloquear toda la vista de grupo
    useEffect(() => {
        const handler = (event: Event) => {
            const detail = (event as CustomEvent<{ grupoId: string; nombreGrupo: string }>).detail
            if (!detail) return

            // Solo bloquear si corresponde a este grupo
            if (detail.grupoId !== group.id) return

            setKickedInfo(detail)
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('group:kicked', handler as EventListener)
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('group:kicked', handler as EventListener)
            }
        }
    }, [group.id])

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

    const handleMemberRemoved = useCallback((memberId: string) => {
        setMembers(prev => prev.filter(m => m.id !== memberId))
    }, [])

    return (
        <>
            {/* Overlay bloqueante si el usuario fue expulsado del grupo */}
            {kickedInfo && (
                <div className={styles.kickedOverlay}>
                    <div className={styles.kickedOverlay__content}>
                        <h2>Fuiste eliminado del grupo</h2>
                        <p>
                            Ya no podés participar en el grupo{' '}
                            <strong>{kickedInfo.nombreGrupo}</strong>. Para volver a entrar,
                            necesitás que te envíen una nueva invitación.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                window.location.href = ROUTES.MAP
                            }}
                            className={styles.kickedOverlay__button}
                        >
                            Volver al mapa
                        </button>
                    </div>
                </div>
            )}

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
                        onMemberRemoved={handleMemberRemoved}
                        isAdmin={isAdmin}
                        currentUserId={auth.user?.uid || ''}
                    />
                </div>
                <div
                    className={`${styles.content__group} ${
                        mobileView === 'group' ? styles.active : ''
                    }`}
                >
                    <GroupComponent
                        admin={auth.user?.displayName || auth.user?.email || ''}
                        activeView={activeView}
                        groupId={group.id}
                        members={members}
                        isAdmin={isAdmin}
                        onClick={handleChangeView}
                        currentRestaurants={currentRestaurants}
                        onRestaurantsChange={setCurrentRestaurants}
                    />
                </div>
            </section>
            <Footer activeView={activeView} onClick={handleChangeView} />
        </>
    )
}
