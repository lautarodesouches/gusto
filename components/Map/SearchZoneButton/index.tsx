'use client'

import styles from './SearchZoneButton.module.css'

interface SearchZoneButtonProps {
    onClick: () => void
    isVisible: boolean
}

export default function SearchZoneButton({ onClick, isVisible }: SearchZoneButtonProps) {
    if (!isVisible) return null

    return (
        <div className={styles.container}>
            <button onClick={onClick} className={styles.button}>
                <span className={styles.icon}>🔍</span>
                Buscar en esta zona
            </button>
        </div>
    )
}

