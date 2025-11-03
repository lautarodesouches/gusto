'use client'
import { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faCheckCircle,
    faExclamationCircle,
    faInfoCircle,
    faTimes,
} from '@fortawesome/free-solid-svg-icons'
import styles from './styles.module.css'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
    id: string
    type: ToastType
    message: string
    duration?: number
    onClose: (id: string) => void
}

export default function Toast({
    id,
    type,
    message,
    duration = 4000,
    onClose,
}: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id)
        }, duration)

        return () => clearTimeout(timer)
    }, [id, duration, onClose])

    const icons = {
        success: faCheckCircle,
        error: faExclamationCircle,
        info: faInfoCircle,
        warning: faExclamationCircle,
    }

    return (
        <div className={`${styles.toast} ${styles[`toast--${type}`]}`}>
            <FontAwesomeIcon
                icon={icons[type]}
                className={styles.toast__icon}
            />
            <p className={styles.toast__message}>{message}</p>
            <button
                className={styles.toast__close}
                onClick={() => onClose(id)}
                type="button"
                aria-label="Cerrar notificación"
            >
                <FontAwesomeIcon icon={faTimes} />
            </button>
        </div>
    )
}
