'use client'
import styles from './styles.module.css'
import { Group } from '@/types'
import Nav from '../Nav'
import GroupSocial from '../Social'
import Footer from '../Footer'
import { useCallback, useState } from 'react'
import GroupComponent from '../Group'

export type ActiveView = 'home' | 'chat' | 'map'

interface Props {
    group: Group
}

export default function GroupClient({ group }: Props) {
    const [activeView, setActiveView] = useState<ActiveView>('home')
    const [mobileView, setMobileView] = useState<'social' | 'group'>('social')

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
            <Nav
                activeView={activeView}
                mobileView={mobileView}
                onClick={handleChangeView}
            />
            <section className={styles.content}>
                <div
                    className={`${styles.content__social} ${
                        mobileView === 'social' ? styles.active : ''
                    }`}
                >
                    <GroupSocial group={group} />
                </div>
                <div
                    className={`${styles.content__group} ${
                        mobileView === 'group' ? styles.active : ''
                    }`}
                >
                    <GroupComponent
                        activeView={activeView}
                        onClick={handleChangeView}
                        groupId={group.id}
                    />
                </div>
            </section>
            <Footer activeView={activeView} onClick={handleChangeView} />
        </>
    )
}
