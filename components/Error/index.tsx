import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faRotateRight } from '@fortawesome/free-solid-svg-icons'
import styles from './styles.module.css'

interface ErrorProps {
    message: string
    onRetry?: () => void
}

export default function Error({ message, onRetry }: ErrorProps) {
    return (
        <div className={styles.error}>
            <div className={styles.error__content}>
                <FontAwesomeIcon 
                    icon={faExclamationTriangle} 
                    className={styles.error__icon}
                />
                <h2 className={styles.error__title}>
                    Algo salió mal
                </h2>
                <p className={styles.error__message}>
                    {message}
                </p>
                {onRetry && (
                    <button 
                        onClick={onRetry}
                        className={styles.error__button}
                        type="button"
                    >
                        <FontAwesomeIcon icon={faRotateRight} />
                        Reintentar
                    </button>
                )}
            </div>
        </div>
    )
}