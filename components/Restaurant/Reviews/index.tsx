import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import styles from './page.module.css'
import { Review } from '@/types'

interface ReviewCardProps {
    review: Review
    showImages?: boolean
}

function ReviewCard({ review, showImages = true }: ReviewCardProps) {
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString)
        const months = [
            'enero',
            'febrero',
            'marzo',
            'abril',
            'mayo',
            'junio',
            'julio',
            'agosto',
            'septiembre',
            'octubre',
            'noviembre',
            'diciembre',
        ]
        return `Escrita el ${date.getDate()} de ${
            months[date.getMonth()]
        } ${date.getFullYear()}`
    }

    return (
        <article className={styles['review-card']}>
            {/* Header */}
            <header className={styles['review-card__header']}>
                <div className={styles['review-card__user']}>
                    <div className={styles['review-card__avatar']}>
                        {review.userAvatar ? (
                            <img
                                src={review.userAvatar}
                                alt={review.userName}
                            />
                        ) : (
                            <span>
                                {review.userName.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <span className={styles['review-card__username']}>
                        {review.userName}
                    </span>
                </div>

                <div className={styles['review-card__rating']}>
                    {[...Array(5)].map((_, index) => (
                        <FontAwesomeIcon
                            key={index}
                            icon={faStar}
                            className={`${styles['review-card__star']} ${
                                index < review.rating
                                    ? styles['review-card__star--filled']
                                    : ''
                            }`}
                        />
                    ))}
                </div>
            </header>

            {/* Content */}
            <div className={styles['review-card__content']}>
                <h3 className={styles['review-card__title']}>{review.title}</h3>
                <p className={styles['review-card__text']}>{review.content}</p>
            </div>

            {/* Images */}
            {showImages && review.images && review.images.length > 0 && (
                <div className={styles['review-card__images']}>
                    {review.images.map((image, index) => (
                        <div
                            key={index}
                            className={styles['review-card__image']}
                        >
                            <img src={image} alt={`Foto ${index + 1}`} />
                        </div>
                    ))}
                </div>
            )}

            {/* Footer */}
            <footer className={styles['review-card__footer']}>
                <time className={styles['review-card__date']}>
                    {formatDate(review.date)}
                </time>
                {review.isVerified && (
                    <div className={styles['review-card__verified']}>
                        Esta opinión es la opinión subjetiva de un miembro de
                        Gusto! no de Gusto! app. Gusto! les hace controles a
                        todas las opiniones.
                    </div>
                )}
            </footer>
        </article>
    )
}

interface ReviewListProps {
    reviews: Review[]
    showImages?: boolean
}

export default function ReviewList({
    reviews,
    showImages = true,
}: ReviewListProps) {
    if (reviews.length === 0) {
        return (
            <div className={styles['review-list__empty']}>
                <p>No hay opiniones disponibles</p>
            </div>
        )
    }

    return (
        <div className={styles['review-list']}>
            {reviews.map(review => (
                <ReviewCard
                    key={review.id}
                    review={review}
                    showImages={showImages}
                />
            ))}
        </div>
    )
}
