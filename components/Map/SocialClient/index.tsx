'use client'
import { SocialData } from '@/types'
import SocialView from '../SocialView'
import { useState } from 'react'

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

    const togglePanel = (panel: ActivePanel) => {
        setActivePanel(prev => (prev === panel ? null : panel))
    }

    return (
        <SocialView
            isVisible={isVisible}
            socialData={socialData}
            activePanel={activePanel}
            togglePanel={togglePanel}
        />
    )
}
