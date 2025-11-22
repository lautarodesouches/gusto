'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons'
import styles from './page.module.css'

interface ErrorAlertProps {
    message: string
    onClose: () => void
}

export default function ErrorAlert({ message, onClose }: ErrorAlertProps) {
    return (
        <div className={styles.alert}>
            <div className={styles.alert__content}>
                <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className={styles.alert__icon}
                />
                <div className={styles.alert__text}>
                    <strong className={styles.alert__title}>Error al enviar solicitud</strong>
                    <p className={styles.alert__message}>{message}</p>
                </div>
                <button
                    className={styles.alert__close}
                    onClick={onClose}
                    type="button"
                    aria-label="Cerrar"
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>
        </div>
    )
}

