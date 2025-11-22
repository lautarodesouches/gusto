'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import styles from './page.module.css'

interface SuccessModalProps {
    onClose: () => void
}

export default function SuccessModal({ onClose }: SuccessModalProps) {
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.card} onClick={(e) => e.stopPropagation()}>
                <div className={styles.iconContainer}>
                    <FontAwesomeIcon icon={faCheckCircle} className={styles.icon} />
                </div>
                <h2 className={styles.title}>
                    ¡Solicitud Enviada Exitosamente!
                </h2>
                <p className={styles.message}>
                    Tu solicitud para registrar tu restaurante en <strong>GUSTO!</strong> ha sido procesada exitosamente.
                </p>
                <div className={styles.infoBox}>
                    <FontAwesomeIcon icon={faEnvelope} className={styles.infoIcon} />
                    <p className={styles.infoText}>
                        Recibirás un email cuando se procese tu solicitud. Te notificaremos si es aceptada.
                    </p>
                </div>
                <button className={styles.button} onClick={onClose}>
                    Entendido
                </button>
            </div>
        </div>
    )
}

