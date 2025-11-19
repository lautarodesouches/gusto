'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import styles from './ProfileButton.module.css'

interface ProfileButtonProps {
    username: string
    isPremium: boolean
    onClick: () => void
}

export default function ProfileButton({ 
    username, 
    isPremium, 
    onClick 
}: ProfileButtonProps) {
    return (
        <button
            className={styles.button}
            onClick={onClick}
        >
            <div className={styles.avatar}>
                <FontAwesomeIcon icon={faUser} />
            </div>
            <span className={styles.name}>
                {username}
            </span>
            {isPremium && (
                <div className={styles.premiumBadge}>
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/>
                        <path d="M5 21h14"/>
                    </svg>
                </div>
            )}
        </button>
    )
}

