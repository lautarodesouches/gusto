'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useRef } from 'react'
import styles from './page.module.css'

interface ErrorAlertProps {
    message: string
    errors?: Record<string, string[]>
    onClose: () => void
}

// Mapeo de nombres de campos del backend a nombres amigables en español
const fieldNames: Record<string, string> = {
    'Nombre': 'Nombre del restaurante',
    'Direccion': 'Dirección',
    'WebsiteUrl': 'Sitio web',
    'Lat': 'Latitud',
    'Lng': 'Longitud',
    'ImagenDestacada': 'Imagen destacada',
    'ImagenMenu': 'Imagen del menú',
    'Logo': 'Logo',
    'ImagenesInterior': 'Imágenes de interior',
    'ImagenesComidas': 'Imágenes de comida',
    'GustosQueSirveIds': 'Gustos que sirve',
    'RestriccionesQueRespetaIds': 'Restricciones que respeta',
    'RestauranteId': 'Restaurante',
    'Valoracion': 'Calificación',
    'Opinion': 'Opinión',
    'Titulo': 'Título',
    'FechaVisita': 'Fecha de visita',
    'MotivoVisita': 'Motivo de visita',
    'Imagenes': 'Imágenes',
}

export default function ErrorAlert({ message, errors, onClose }: ErrorAlertProps) {
    // Si hay errores de validación, mostrar solo esos
    const hasValidationErrors = errors && Object.keys(errors).length > 0
    const alertRef = useRef<HTMLDivElement>(null)
    
    // Hacer scroll automático al modal cuando aparezca
    useEffect(() => {
        if (alertRef.current) {
            alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }, [])
    
    return (
        <div className={styles.alert} ref={alertRef}>
            <div className={styles.alert__content}>
                <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className={styles.alert__icon}
                />
                <div className={styles.alert__text}>
                    {hasValidationErrors ? (
                        <div className={styles.alert__errors}>
                            <p className={styles.alert__errorsTitle}>Por favor, corrige los siguientes errores:</p>
                            <ul className={styles.alert__errorsList}>
                                {Object.entries(errors).map(([field, fieldErrors]) => (
                                    <li key={field} className={styles.alert__errorItem}>
                                        <strong className={styles.alert__errorField}>
                                            {fieldNames[field] || field}:
                                        </strong>
                                        <ul className={styles.alert__errorMessages}>
                                            {fieldErrors.map((errorMsg, index) => (
                                                <li key={index} className={styles.alert__errorMessage}>
                                                    {errorMsg}
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <>
                            <strong className={styles.alert__title}>Error al enviar solicitud</strong>
                            {message && <p className={styles.alert__message}>{message}</p>}
                        </>
                    )}
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

