'use client'
import styles from './modal.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faX } from '@fortawesome/free-solid-svg-icons'

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    confirmButtonStyle?: 'primary' | 'danger'
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    confirmButtonStyle = 'primary',
}: ConfirmModalProps) {
    if (!isOpen) return null

    const handleConfirm = () => {
        onConfirm()
        onClose()
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.modal__close} onClick={onClose}>
                    <FontAwesomeIcon icon={faX} />
                </button>
                <h2 className={styles.modal__title}>{title}</h2>
                <p className={styles.modal__text}>{message}</p>

                <div className={styles.modal__actions}>
                    <button
                        onClick={handleConfirm}
                        className={
                            confirmButtonStyle === 'danger'
                                ? styles.modal__button_danger
                                : styles.modal__button_primary
                        }
                    >
                        {confirmText}
                    </button>
                    <button onClick={onClose} className={styles.modal__button_secondary}>
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    )
}

