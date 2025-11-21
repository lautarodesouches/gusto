'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import styles from './page.module.css'
import { SolicitudRestaurante } from '@/types'


interface RequestCardProps {
    solicitud: SolicitudRestaurante
    onAceptar?: (id: string) => void
    onRechazar?: (id: string) => void
    onVerDetalles?: (id: string) => void
    onDarBaja?: (id: string) => void
    onRemover?: (id: string) => void
    isLoading?: boolean
}

export default function RequestCard({
    solicitud,
    onAceptar,
    onRechazar,
    onVerDetalles,
    onDarBaja,
    onRemover,
    isLoading = false,
}: RequestCardProps) {
    const status = solicitud.status || 'Pendiente'
    
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            })
        } catch {
            return ''
        }
    }

    return (
        <div className={styles.card}>
            <div className={styles.card__header}>
                <div className={styles.card__titleContainer}>
                    <h3 className={styles.card__title}>{solicitud.nombreRestaurante}</h3>
                    <span className={styles.card__localidad}>{solicitud.direccion}</span>
                </div>
                <span className={`${styles.card__status} ${styles[`card__status--${status.toLowerCase()}`]}`}>
                    {status}
                </span>
            </div>

            <div className={styles.card__imageContainer}>
                {solicitud.imgLogo && solicitud.imgLogo.trim() !== '' ? (
                    <img
                        src={solicitud.imgLogo}
                        alt={solicitud.nombreRestaurante}
                        className={styles.card__image}
                        onError={(e) => {
                            // Si falla la imagen, ocultar y mostrar placeholder
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const container = target.parentElement
                            if (container) {
                                const placeholder = container.querySelector(`.${styles.card__imagePlaceholder}`) as HTMLElement
                                if (placeholder) {
                                    placeholder.style.display = 'flex'
                                }
                            }
                        }}
                    />
                ) : (
                    <div className={styles.card__imagePlaceholder}>
                        <span>Sin imagen</span>
                    </div>
                )}
            </div>

            <div className={styles.card__info}>
                <p className={styles.card__infoText}>
                    <strong>Usuario:</strong> {solicitud.usuarioNombre}
                </p>
                <p className={styles.card__infoText}>
                    <strong>Email:</strong> {solicitud.usuarioEmail}
                </p>
                <p className={styles.card__infoText}>
                    <strong>Fecha:</strong> {formatDate(solicitud.fechaCreacionUtc)}
                </p>
            </div>

            <div className={styles.card__actions}>
                <button
                    className={styles.card__iconButton}
                    onClick={() => onVerDetalles?.(solicitud.id)}
                    type="button"
                    title="Ver detalles"
                >
                    <FontAwesomeIcon icon={faInfoCircle} />
                </button>

                {status === 'Pendiente' && (
                    <>
                        <button
                            className={`${styles.card__button} ${styles['card__button--rechazar']}`}
                            onClick={() => onRechazar?.(solicitud.id)}
                            disabled={isLoading}
                            type="button"
                        >
                            Rechazar
                        </button>
                        <button
                            className={`${styles.card__button} ${styles['card__button--aceptar']}`}
                            onClick={() => onAceptar?.(solicitud.id)}
                            disabled={isLoading}
                            type="button"
                        >
                            Aceptar
                        </button>
                    </>
                )}

                {status === 'Aceptado' && (
                    <button
                        className={`${styles.card__button} ${styles['card__button--baja']}`}
                        onClick={() => onDarBaja?.(solicitud.id)}
                        disabled={isLoading}
                        type="button"
                    >
                        Dar de baja
                    </button>
                )}

                {status === 'Rechazado' && (
                    <button
                        className={`${styles.card__button} ${styles['card__button--remover']}`}
                        onClick={() => onRemover?.(solicitud.id)}
                        disabled={isLoading}
                        type="button"
                    >
                        Remover del panel
                    </button>
                )}
            </div>
        </div>
    )
}

