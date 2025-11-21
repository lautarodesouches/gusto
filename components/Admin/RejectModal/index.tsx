'use client'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import styles from './page.module.css'

interface RejectModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (motivo: string) => void
    isLoading?: boolean
}

export default function RejectModal({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
}: RejectModalProps) {
    const [motivo, setMotivo] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (motivo.trim()) {
            onConfirm(motivo.trim())
            setMotivo('') // Limpiar después de confirmar
        }
    }

    const handleClose = () => {
        setMotivo('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modal__header}>
                    <h2 className={styles.modal__title}>Rechazar Solicitud</h2>
                    <button
                        className={styles.modal__close}
                        onClick={handleClose}
                        type="button"
                        aria-label="Cerrar"
                        disabled={isLoading}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.modal__content}>
                        <p className={styles.modal__description}>
                            Por favor, indica el motivo del rechazo de esta solicitud:
                        </p>
                        <textarea
                            className={styles.modal__textarea}
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            placeholder="Ej: Información incompleta, datos incorrectos, etc."
                            rows={5}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.modal__footer}>
                        <button
                            type="button"
                            className={styles.modal__buttonCancel}
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={styles.modal__buttonConfirm}
                            disabled={isLoading || !motivo.trim()}
                        >
                            {isLoading ? 'Rechazando...' : 'Confirmar Rechazo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

