'use client'

import styles from './MyLocationButton.module.css'

interface MyLocationButtonProps {
    onClick: () => void
}

export default function MyLocationButton({ onClick }: MyLocationButtonProps) {
    return (
        <button className={styles.button} onClick={onClick} aria-label="Ir a mi ubicación">
            <span className={styles.icon}>📍</span>
        </button>
    )
}
