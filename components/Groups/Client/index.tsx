'use client'
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

    const handleChangeView = useCallback((view: ActiveView) => {
        setActiveView(view)
    }, [])

    return (
        <>
            <Nav activeView={activeView} />
            {activeView === 'home' ? (
                <GroupSocial group={group} />
            ) : (
                <GroupComponent groupId={group.id} activeView={activeView} />
            )}
            <Footer activeView={activeView} onClick={handleChangeView} />
        </>
    )
}
