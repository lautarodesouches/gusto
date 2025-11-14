'use client'
import { SocialData } from '@/types'
import SocialView from '../SocialView'
import { useCallback, useEffect, useState } from 'react'
import { getGroupsData } from '@/app/actions/groups'
import { getFriendsData } from '@/app/actions/friends'

interface Props {
    isVisible?: boolean
    onClose?: () => void
    socialData: SocialData
    isExpanded?: boolean
    onToggleExpand?: () => void
    activePanel?: 'searchFriend' | 'newGroup' | null
    onTogglePanel?: (panel: 'searchFriend' | 'newGroup' | null) => void
}

type ActivePanel = 'searchFriend' | 'newGroup' | null

export default function SocialClient({
    isVisible = true,
    socialData,
    isExpanded = true,
    onToggleExpand,
    activePanel: externalActivePanel,
    onTogglePanel: externalTogglePanel,
}: Props) {
    const [internalActivePanel, setInternalActivePanel] = useState<ActivePanel>(null)
    const [data, setData] = useState<SocialData>(socialData)

    // Usar panel externo si se proporciona, sino usar el interno
    const activePanel = externalActivePanel !== undefined ? externalActivePanel : internalActivePanel
    
    const togglePanel = (panel: ActivePanel) => {
        if (externalTogglePanel) {
            externalTogglePanel(panel)
        } else {
            setInternalActivePanel(prev => (prev === panel ? null : panel))
        }
    }

    const refreshGroups = useCallback(async () => {
        const res = await getGroupsData()
        if (res.success) {
            setData(prev => ({
                ...prev,
                groups: res.data?.groups ?? prev.groups,
                groupsRequests: res.data?.groupsRequests ?? prev.groupsRequests,
            }))
        }
    }, [])

    const refreshFriends = useCallback(async () => {
        const res = await getFriendsData()
        if (res.success && res.data) {
            setData(prev => ({
                ...prev,
                friends: res.data?.friends ?? [],
                friendsRequests: res.data?.friendsRequests ?? [],
            }))
        }
    }, [])

    useEffect(() => {
        const handlerGroups = () => {
            refreshGroups()
        }
        const handlerFriends = () => {
            refreshFriends()
        }
        if (typeof window !== 'undefined') {
            window.addEventListener('groups:refresh', handlerGroups)
            window.addEventListener('friends:refresh', handlerFriends)
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('groups:refresh', handlerGroups)
                window.removeEventListener('friends:refresh', handlerFriends)
            }
        }
    }, [refreshGroups, refreshFriends])

    return (
        <SocialView
            isVisible={isVisible}
            socialData={data}
            activePanel={activePanel}
            togglePanel={togglePanel}
            isExpanded={isExpanded}
            onToggleExpand={onToggleExpand}
        />
    )
}
