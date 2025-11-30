import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import styles from './page.module.css'
import { Review } from '@/types'
import Image from 'next/image'

interface ReviewCardProps {
  review: Review
  showImages?: boolean
  isLocal?: boolean
}

function ReviewCard({ review, showImages = true, isLocal = false }: ReviewCardProps) {
  const getDisplayName = () =>
    review.autor || review.userName || 'Anónimo'

  const getAvatar = () =>
    review.foto || review.userAvatar || ''

  const getText = () =>
    review.texto || review.content || ''

 const getDate = () => {
  // Si ya viene en español tipo "hace 3 semanas", la mostramos tal cual
  if (review.fecha && /hace|ayer|semana|mes|día/.test(review.fecha)) {
    return `${review.fecha}`
  }

  // Si tiene formato ISO válido (por ejemplo "2025-10-15T02:56:50.0034944Z")
  const date = new Date(review.fecha || review.fecha || '')
  if (isNaN(date.getTime())) return 'Fecha no disponible'

  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ]

  return `Escrita el ${date.getDate()} de ${months[date.getMonth()]} ${date.getFullYear()}`
}


  return (
    <article className={`${styles['review-card']} ${isLocal ? styles['review-card--local'] : ''}`}>
      <header className={styles['review-card__header']}>
        <div className={styles['review-card__user']}>
          <div className={styles['review-card__avatar']}>
            {getAvatar() ? (
              <Image
                src={getAvatar()}
                alt={getDisplayName()}
                width={40}
                height={40}
                className={styles['review-card__avatar']}
              />
            ) : (
              <span>{getDisplayName().charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className={styles['review-card__user-info']}>
            <span className={styles['review-card__username']}>
              {getDisplayName()}
            </span>
            {isLocal && (
              <div className={styles['review-card__badge']}>
                <FontAwesomeIcon icon={faCheckCircle} className={styles['review-card__badge-icon']} />
                <span className={styles['review-card__badge-text']}>Gusto!</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles['review-card__rating']}>
          {[...Array(5)].map((_, index) => (
            <FontAwesomeIcon
              key={index}
              icon={faStar}
              className={`${styles['review-card__star']} ${
                index < review.rating ? styles['review-card__star--filled'] : ''
              }`}
            />
          ))}
        </div>
      </header>

      {/* Content */}
      <div className={styles['review-card__content']}>
        <p className={styles['review-card__text']}>{getText()}</p>
      </div>

      {/* Images (para compatibilidad futura) */}
      {showImages && review.images && review.images.length > 0 && (
        <div className={styles['review-card__images']}>
          {review.images.map((image, index) => (
            <div key={index} className={styles['review-card__image']}>
              <Image
                src={image}
                alt={`Foto ${index + 1}`}
                width={200}
                height={200}
                className={styles['review-card__image']}
              />
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <footer className={styles['review-card__footer']}>
        <time className={styles['review-card__date']}>{getDate()}</time>
      </footer>
    </article>
  )
}

interface ReviewListProps {
  reviews: Review[]
  showImages?: boolean
  isLocal?: boolean
  localReviewIds?: Set<string>
}

export default function ReviewList({
  reviews,
  showImages = true,
  isLocal = false,
  localReviewIds,
}: ReviewListProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className={styles['review-list__empty']}>
        <p>No hay opiniones disponibles</p>
      </div>
    )
  }

  return (
    <div className={styles['review-list']}>
      {reviews.map((r) => {
        // Determinar si es local: SOLO si está en el Set de IDs locales
        const isLocalReview = localReviewIds?.has(r.id) ?? false
        
        return (
          <ReviewCard 
            key={r.id} 
            review={r} 
            showImages={showImages} 
            isLocal={isLocalReview} 
          />
        )
      })}
    </div>
  )
}
