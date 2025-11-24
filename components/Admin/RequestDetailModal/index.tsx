'use client'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faMapMarkerAlt, faClock, faUtensils, faBan, faImages, faFileImage, faGlobe } from '@fortawesome/free-solid-svg-icons'
import styles from './page.module.css'
import type { SolicitudRestauranteDetalle } from '@/types'
import Loading from '@/components/Loading'

interface RequestDetailModalProps {
    solicitudId: string
    isOpen: boolean
    onClose: () => void
}

export default function RequestDetailModal({
    solicitudId,
    isOpen,
    onClose,
}: RequestDetailModalProps) {
    const [detalle, setDetalle] = useState<SolicitudRestauranteDetalle | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && solicitudId) {
            loadDetalle()
        } else {
            // Limpiar datos al cerrar
            setDetalle(null)
            setError(null)
        }
    }, [isOpen, solicitudId])

    const loadDetalle = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await fetch(`/api/admin/detalle/${solicitudId}`)
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                setError(errorData.error || 'Error al cargar los detalles')
                return
            }
            
            const data: SolicitudRestauranteDetalle = await response.json()
            setDetalle(data)
        } catch (err) {
            console.error('Error al cargar detalles:', err)
            setError('Error inesperado al cargar los detalles')
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })
        } catch {
            return dateString
        }
    }

    const formatHorario = (horario: { dia: string; cerrado: boolean; desde?: string | null; hasta?: string | null }) => {
        const dia = horario.dia.trim()
        if (horario.cerrado) {
            return `${dia}: Cerrado`
        }
        const desde = horario.desde || ''
        const hasta = horario.hasta || ''
        if (desde && hasta) {
            return `${dia}: ${desde} - ${hasta}`
        }
        return `${dia}: Horario no especificado`
    }

    if (!isOpen) return null

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modal__header}>
                    <h2 className={styles.modal__title}>Detalles de la Solicitud</h2>
                    <button
                        className={styles.modal__close}
                        onClick={onClose}
                        type="button"
                        aria-label="Cerrar"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className={styles.modal__content}>
                    {isLoading ? (
                        <div className={styles.modal__loading}>
                            <Loading message="Cargando detalles..." />
                        </div>
                    ) : error ? (
                        <div className={styles.modal__error}>
                            <p>{error}</p>
                            <button
                                className={styles.modal__retry}
                                onClick={loadDetalle}
                                type="button"
                            >
                                Reintentar
                            </button>
                        </div>
                    ) : detalle ? (
                        <>
                            {/* Información del Usuario */}
                            <section className={styles.section}>
                                <h3 className={styles.section__title}>Información del Usuario</h3>
                                <div className={styles.section__content}>
                                    <p><strong>Nombre:</strong> {detalle.usuarioNombre}</p>
                                    <p><strong>Email:</strong> {detalle.usuarioEmail}</p>
                                    <p><strong>ID Usuario:</strong> {detalle.usuarioId}</p>
                                </div>
                            </section>

                            {/* Información del Restaurante */}
                            <section className={styles.section}>
                                <h3 className={styles.section__title}>Información del Restaurante</h3>
                                <div className={styles.section__content}>
                                    <p><strong>Nombre:</strong> {detalle.nombreRestaurante}</p>
                                    <p>
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.icon} />
                                        <strong>Dirección:</strong> {detalle.direccion}
                                    </p>
                                    {(detalle.latitud && detalle.longitud) && (
                                        <p>
                                            <strong>Coordenadas:</strong> {detalle.latitud.toFixed(6)}, {detalle.longitud.toFixed(6)}
                                        </p>
                                    )}
                                    {detalle.websiteUrl && (
                                        <p>
                                            <FontAwesomeIcon icon={faGlobe} className={styles.icon} />
                                            <strong>Sitio Web:</strong>{' '}
                                            <a 
                                                href={detalle.websiteUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className={styles.link}
                                            >
                                                {detalle.websiteUrl}
                                            </a>
                                        </p>
                                    )}
                                    {detalle.primaryType && (
                                        <p><strong>Tipo Principal:</strong> {detalle.primaryType}</p>
                                    )}
                                    {detalle.types.length > 0 && (
                                        <div>
                                            <strong>Tipos:</strong>
                                            <ul className={styles.list}>
                                                {detalle.types.map((type: string, idx: number) => (
                                                    <li key={idx}>{type}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Horarios */}
                            <section className={styles.section}>
                                <h3 className={styles.section__title}>
                                    <FontAwesomeIcon icon={faClock} className={styles.icon} />
                                    Horarios
                                </h3>
                                <div className={styles.section__content}>
                                    {detalle.horarios.length > 0 ? (
                                        <ul className={styles.horariosList}>
                                            {detalle.horarios.map((horario: SolicitudRestauranteDetalle['horarios'][0], idx: number) => (
                                                <li key={idx} className={horario.cerrado ? styles.horarioCerrado : ''}>
                                                    {formatHorario(horario)}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className={styles.noData}>No hay horarios registrados</p>
                                    )}
                                </div>
                            </section>

                            {/* Gustos */}
                            {detalle.gustos.length > 0 && (
                                <section className={styles.section}>
                                    <h3 className={styles.section__title}>
                                        <FontAwesomeIcon icon={faUtensils} className={styles.icon} />
                                        Gustos que Sirve
                                    </h3>
                                    <div className={styles.section__content}>
                                        <div className={styles.tags}>
                                            {detalle.gustos.map((gusto: SolicitudRestauranteDetalle['gustos'][0]) => (
                                                <span key={gusto.id} className={styles.tag}>
                                                    {gusto.nombre}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Restricciones */}
                            {detalle.restricciones.length > 0 && (
                                <section className={styles.section}>
                                    <h3 className={styles.section__title}>
                                        <FontAwesomeIcon icon={faBan} className={styles.icon} />
                                        Restricciones que Respeta
                                    </h3>
                                    <div className={styles.section__content}>
                                        <div className={styles.tags}>
                                            {detalle.restricciones.map((restriccion: SolicitudRestauranteDetalle['restricciones'][0]) => (
                                                <span key={restriccion.id} className={styles.tag}>
                                                    {restriccion.nombre}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Imágenes */}
                            <section className={styles.section}>
                                <h3 className={styles.section__title}>
                                    <FontAwesomeIcon icon={faImages} className={styles.icon} />
                                    Imágenes
                                </h3>
                                <div className={styles.section__content}>
                                    {detalle.logo && detalle.logo.trim() !== '' ? (
                                        <div className={styles.imageGroup}>
                                            <h4 className={styles.imageGroup__title}>Logo</h4>
                                            <img
                                                src={detalle.logo}
                                                alt="Logo"
                                                className={styles.image}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement
                                                    target.style.display = 'none'
                                                }}
                                            />
                                        </div>
                                    ) : null}
                                    {detalle.imagenesDestacadas && detalle.imagenesDestacadas.trim() !== '' ? (
                                        <div className={styles.imageGroup}>
                                            <h4 className={styles.imageGroup__title}>Imagen Destacada</h4>
                                            <img
                                                src={detalle.imagenesDestacadas}
                                                alt="Imagen destacada"
                                                className={styles.image}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement
                                                    target.style.display = 'none'
                                                }}
                                            />
                                        </div>
                                    ) : null}
                                    {detalle.imagenesInterior.length > 0 ? (
                                        <div className={styles.imageGroup}>
                                            <h4 className={styles.imageGroup__title}>Imágenes del Interior ({detalle.imagenesInterior.length})</h4>
                                            <div className={styles.imageGrid}>
                                                {detalle.imagenesInterior
                                                    .filter((img: string) => img && img.trim() !== '')
                                                    .map((img: string, idx: number) => (
                                                        <img
                                                            key={idx}
                                                            src={img}
                                                            alt={`Interior ${idx + 1}`}
                                                            className={styles.image}
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement
                                                                target.style.display = 'none'
                                                            }}
                                                        />
                                                    ))}
                                            </div>
                                        </div>
                                    ) : null}
                                    {detalle.imagenesComida.length > 0 ? (
                                        <div className={styles.imageGroup}>
                                            <h4 className={styles.imageGroup__title}>Imágenes de Comidas ({detalle.imagenesComida.length})</h4>
                                            <div className={styles.imageGrid}>
                                                {detalle.imagenesComida
                                                    .filter((img: string) => img && img.trim() !== '')
                                                    .map((img: string, idx: number) => (
                                                        <img
                                                            key={idx}
                                                            src={img}
                                                            alt={`Comida ${idx + 1}`}
                                                            className={styles.image}
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement
                                                                target.style.display = 'none'
                                                            }}
                                                        />
                                                    ))}
                                            </div>
                                        </div>
                                    ) : null}
                                    {detalle.imagenMenu && detalle.imagenMenu.trim() !== '' ? (
                                        <div className={styles.imageGroup}>
                                            <h4 className={styles.imageGroup__title}>
                                                <FontAwesomeIcon icon={faFileImage} className={styles.icon} />
                                                Menú
                                            </h4>
                                            <img
                                                src={detalle.imagenMenu}
                                                alt="Menú"
                                                className={styles.image}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement
                                                    target.style.display = 'none'
                                                }}
                                            />
                                        </div>
                                    ) : null}
                                    {!detalle.logo && 
                                     !detalle.imagenesDestacadas && 
                                     detalle.imagenesInterior.length === 0 && 
                                     detalle.imagenesComida.length === 0 && 
                                     !detalle.imagenMenu && (
                                        <p className={styles.noData}>No hay imágenes registradas</p>
                                    )}
                                </div>
                            </section>

                            {/* Metadatos */}
                            <section className={styles.section}>
                                <h3 className={styles.section__title}>Metadatos</h3>
                                <div className={styles.section__content}>
                                    <p><strong>ID Solicitud:</strong> {detalle.id}</p>
                                    <p><strong>Fecha de Creación:</strong> {formatDate(detalle.fechaCreacionUtc)}</p>
                                </div>
                            </section>
                        </>
                    ) : null}
                </div>

                <div className={styles.modal__footer}>
                    <button
                        className={styles.modal__button}
                        onClick={onClose}
                        type="button"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}

