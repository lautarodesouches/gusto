'use client'

import NotificationBell from '@/components/NotificationBell'
import styles from './NotificationButton.module.css'

interface NotificationButtonProps {
    isActive: boolean
    showPanel: boolean
    onClick: () => void
}

export default function NotificationButton({ 
    isActive, 
    showPanel, 
    onClick 
}: NotificationButtonProps) {
    return (
        <div 
            className={`${styles.button} ${isActive ? styles.active : ''}`}
            onClick={onClick}
        >
            <NotificationBell 
                showPanel={showPanel}
                isActive={isActive}
            />
        </div>
    )
}

