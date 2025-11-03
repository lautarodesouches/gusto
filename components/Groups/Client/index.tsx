'use client'
import { Group } from '@/types'
import Nav from '../Nav'
import GroupSocial from '../Social'
import Footer from '../Footer'
import { useState } from 'react'
import GroupComponent from '../Group'

interface Props {
    group: Group
}

export default function GroupClient({ group }: Props) {
    const [activeView, setActiveView] = useState<'inicio' | 'grupo'>('inicio')

    const handleChangeView = (view: 'inicio' | 'grupo') => {
        setActiveView(view)
    }

    return (
        <>
            <Nav activeView={activeView} />
            {activeView === 'inicio' ? (
                <GroupSocial group={group} />
            ) : (
                <GroupComponent />
            )}
            <Footer activeView={activeView} onClick={handleChangeView} />
        </>
    )
}
