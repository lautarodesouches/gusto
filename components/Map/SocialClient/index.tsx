'use client'
import { SocialData } from '@/types'
import SocialView from '../SocialView'
import { useCallback, useEffect, useState } from 'react'
import { getGroupsData } from '@/app/actions/groups'

interface Props {
    isVisible?: boolean
    onClose?: () => void
    socialData: SocialData
}

type ActivePanel = 'searchFriend' | 'newGroup' | null

export default function SocialClient({
    isVisible = true,
    socialData,
}: Props) {
    const [activePanel, setActivePanel] = useState<ActivePanel>(null)
    const [data, setData] = useState<SocialData>(socialData)

    const togglePanel = (panel: ActivePanel) => {
        setActivePanel(prev => (prev === panel ? null : panel))
    }

    const refreshGroups = useCallback(async () => {
        const res = await getGroupsData()
        if (res.success && res.data) {
            setData(prev => ({
                ...prev,
                groups: res.data.groups,
                groupsRequests: res.data.groupsRequests,
            }))
        }
    }, [])

    useEffect(() => {
        const handler = () => {
            refreshGroups()
        }
        if (typeof window !== 'undefined') {
            window.addEventListener('groups:refresh', handler)
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('groups:refresh', handler)
            }
        }
    }, [refreshGroups])

    return (
        <SocialView
            isVisible={isVisible}
            socialData={data}
            activePanel={activePanel}
            togglePanel={togglePanel}
        />
    )
}
