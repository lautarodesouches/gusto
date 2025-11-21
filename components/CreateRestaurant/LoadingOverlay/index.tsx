'use client'
import styles from './page.module.css'

export default function LoadingOverlay() {
    return (
        <div className={styles.overlay}>
            <div className={styles.content}>
                <div className={styles.spinner}>
                    <div className={styles.spinner__ring}></div>
                    <div className={styles.spinner__ring}></div>
                    <div className={styles.spinner__ring}></div>
                </div>
                <h2 className={styles.title}>Enviando solicitud...</h2>
                <p className={styles.subtitle}>
                    Por favor espera mientras procesamos tu solicitud
                </p>
            </div>
        </div>
    )
}

