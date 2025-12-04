import { useState } from 'react'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faImage,
    faTimes,
    faChevronLeft,
    faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { Restaurant } from '@/types'
import styles from './page.module.css'
import { getSafeImageUrl } from './utils'

interface Props {
    restaurant: Restaurant
}

export default function RestaurantGallery({ restaurant }: Props) {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

    // Combinar todas las imágenes en un solo array para el lightbox (sin incluir el menú OCR)
    const allImages = [
        ...(restaurant.imagenesInterior || []).map((url, idx) => ({ url, type: 'interior', index: idx })),
        ...(restaurant.imagenesComida || []).map((url, idx) => ({ url, type: 'comida', index: idx })),
    ].filter(img => img.url)

    const currentImage = selectedImageIndex !== null ? allImages[selectedImageIndex] : null
    const interiorCount = restaurant.imagenesInterior?.length || 0

    const handleNextImage = () => {
        if (selectedImageIndex !== null && selectedImageIndex < allImages.length - 1) {
            setSelectedImageIndex(selectedImageIndex + 1)
        }
    }

    const handlePrevImage = () => {
        if (selectedImageIndex !== null && selectedImageIndex > 0) {
            setSelectedImageIndex(selectedImageIndex - 1)
        }
    }

    return (
        <>
            <div className={styles.gallery}>
                {/* Imagen principal */}
                <div
                    className={styles.gallery__main}
                    onClick={() => {
                        if (restaurant.esDeLaApp && allImages.length > 0) {
                            setSelectedImageIndex(0)
                        }
                    }}
                    style={restaurant.esDeLaApp && allImages.length > 0 ? { cursor: 'pointer' } : {}}
                >
                    <Image
                        src={getSafeImageUrl(
                            restaurant.imagenUrl || restaurant.imagenDestacada,
                            `/images/restaurant/main.png`
                        )}
                        className={styles.gallery__mainimage}
                        alt="Imagen destacada del restaurante"
                        width={800}
                        height={600}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/images/restaurant/main.png'
                        }}
                    />
                    <div className={styles.gallery__badge}>
                        <FontAwesomeIcon
                            icon={faImage}
                            className={styles.gallery__badgeicon}
                        />
                        {/*<span>
                            {restaurant.esDeLaApp 
                                ? allImages.length
                                : 25
                            }
                        </span>*/}
                    </div>
                </div>

                {/* Fila de 3 imágenes debajo */}
                <div className={styles['gallery__side']}>
                    {/* Primera imagen de interior */}
                    {restaurant.imagenesInterior && restaurant.imagenesInterior.length > 0 && (
                        <div
                            className={`${styles['gallery__side-item']} ${styles['gallery__side-item--clickable']}`}
                            onClick={() => setSelectedImageIndex(0)}
                            style={{ cursor: 'pointer' }}
                        >
                            <Image
                                className={styles['gallery__side-image']}
                                src={getSafeImageUrl(restaurant.imagenesInterior[0], '/images/restaurant/interior.png')}
                                alt="Interior"
                                width={400}
                                height={300}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = '/images/restaurant/interior.png'
                                }}
                            />
                            <div className={styles['gallery__side-info']}>
                                <span className={styles['gallery__side-title']}>Interior</span>
                            </div>
                        </div>
                    )}

                    {/* Primera imagen de comida */}
                    {restaurant.imagenesComida && restaurant.imagenesComida.length > 0 && (
                        <div
                            className={`${styles['gallery__side-item']} ${styles['gallery__side-item--clickable']}`}
                            onClick={() => {
                                const comidaIndex = interiorCount
                                if (comidaIndex < allImages.length) {
                                    setSelectedImageIndex(comidaIndex)
                                }
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            <Image
                                className={styles['gallery__side-image']}
                                src={getSafeImageUrl(restaurant.imagenesComida[0], '/images/restaurant/comida.png')}
                                alt="Comida"
                                width={400}
                                height={300}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = '/images/restaurant/comida.png'
                                }}
                            />
                            <div className={styles['gallery__side-info']}>
                                <span className={styles['gallery__side-title']}>Comida</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {currentImage && (
                <div className={styles.gallery__lightbox} onClick={() => setSelectedImageIndex(null)}>
                    <div className={styles.gallery__lightboxContent} onClick={(e) => e.stopPropagation()}>
                        <button
                            className={styles.gallery__lightboxClose}
                            onClick={() => setSelectedImageIndex(null)}
                            aria-label="Cerrar"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                        {selectedImageIndex !== null && selectedImageIndex > 0 && (
                            <button
                                className={styles.gallery__lightboxNav}
                                style={{ left: '20px' }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handlePrevImage()
                                }}
                                aria-label="Imagen anterior"
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                        )}
                        {selectedImageIndex !== null && selectedImageIndex < allImages.length - 1 && (
                            <button
                                className={styles.gallery__lightboxNav}
                                style={{ right: '20px' }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleNextImage()
                                }}
                                aria-label="Imagen siguiente"
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        )}
                        <div className={styles.gallery__lightboxImageContainer}>
                            <Image
                                src={getSafeImageUrl(currentImage.url, '/images/all/poster.jpg')}
                                alt={`${currentImage.type} ${currentImage.index + 1}`}
                                width={1200}
                                height={800}
                                className={styles.gallery__lightboxImage}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = '/images/all/poster.jpg'
                                }}
                            />
                        </div>
                        <div className={styles.gallery__lightboxInfo}>
                            <span className={styles.gallery__lightboxCounter}>
                                {selectedImageIndex !== null ? selectedImageIndex + 1 : 0} / {allImages.length}
                            </span>
                            <span className={styles.gallery__lightboxType}>
                                {currentImage.type === 'interior' ? 'Interior' : currentImage.type === 'comida' ? 'Comida' : 'Menú'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
