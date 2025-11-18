'use client'
import styles from './modal.module.css'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/routes'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faX } from '@fortawesome/free-solid-svg-icons'

interface IncompleteRegistrationModalProps {
    paso: number
    onClose: () => void
}

export function IncompleteRegistrationModal({ paso, onClose }: IncompleteRegistrationModalProps) {
    const router = useRouter()

    const handleRedirect = () => {
        router.push(`${ROUTES.STEPS}/${paso}`)
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.modal__close} onClick={onClose}>
                    <FontAwesomeIcon icon={faX} />
                </button>
                <h2 className={styles.modal__title}>Completa tu registro 🍽️</h2>
                <p className={styles.modal__text}>
                    Para aprovechar al máximo GustosApp, te recomendamos completar tus preferencias.
                </p>

                <div className={styles.modal__actions}>
                    <button onClick={handleRedirect} className={styles.modal__button_primary}>
                        Completar ahora
                    </button>
                    <button onClick={onClose} className={styles.modal__button_secondary}>
                        Más tarde
                    </button>
                </div>
            </div>
        </div>
    )
}
