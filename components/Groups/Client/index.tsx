'use client'
import styles from './styles.module.css'
import { Group } from '@/types'
import GroupSocial from '../Social'
import Footer from '../Footer'
import { useCallback, useState } from 'react'
import GroupComponent from '../Group'
import { useAuth } from '@/context/AuthContext'
import Switch from '../Switch'

export type ActiveView = 'home' | 'chat' | 'map'

interface Props {
    group: Group
}

export default function GroupClient({ group }: Props) {
    const auth = useAuth()

    const [activeView, setActiveView] = useState<ActiveView>('home')
    const [mobileView, setMobileView] = useState<'social' | 'group'>('social')

    const [members, setMembers] = useState(
        group.miembros.map(m => ({ ...m, checked: true }))
    )

    const handleToggleCheck = (id: string) => {
        console.log(id, members)

        setMembers(prev =>
            prev.map(m => (m.id === id ? { ...m, checked: !m.checked } : m))
        )
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
