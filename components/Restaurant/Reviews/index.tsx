import Image from 'next/image'
import styles from './page.module.css'
import { Review } from '@/types'

interface ReviewCardProps {
  review: Review
  showImages?: boolean
  isLocal?: boolean
}

function ReviewCard({ review, showImages = true, isLocal = false }: ReviewCardProps) {
  const getDisplayName = () =>
    review.autor || review.usuario?.nombre || review.userName || 'Anónimo'

  const getAvatar = () =>
    review.foto || review.usuario?.fotoPerfilUrl || review.userAvatar || ''

  const getText = () =>
    review.texto || review.content || review.opinion || ''

  const getTitle = () =>
    review.titulo || review.title || ''

  const getDate = () => {
    // Si ya viene en español tipo "hace 3 semanas", la mostramos tal cual
    if (review.fecha && /hace|ayer|semana|mes|día/.test(review.fecha)) {
      return `${review.fecha}`
    }

    // Si tiene formato ISO válido (por ejemplo "2025-10-15T02:56:50.0034944Z")
    const date = new Date(review.fechaCreacion || review.fecha || '')
    if (isNaN(date.getTime())) return 'Fecha no disponible'

    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ]

    return `${date.getDate()} de ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  // Generar estrellas usando SVGs
  const renderStars = () => {
    const stars = []
    const rating = review.rating || review.valoracion || 0

    for (let i = 1; i <= 5; i++) {
      let starSrc = '/images/all/star-empty.svg'

      if (rating >= i) {
        starSrc = '/images/all/star.svg'
      } else if (rating >= i - 0.5) {
        starSrc = '/images/all/star-half.svg'
      }

      stars.push(
        <Image
          key={i}
          src={starSrc}
          alt=""
          width={18}
          height={18}
          className={styles['review-card__star']}
        />
      )
    }

    return stars
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
                className={styles['review-card__avatar-img']}
              />
            ) : (
              <span className={styles['review-card__avatar-fallback']}>
                {getDisplayName().charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className={styles['review-card__user-info']}>
            <span className={styles['review-card__username']}>
              {getDisplayName()}
            </span>
            <time className={styles['review-card__date']}>{getDate()}</time>
          </div>
        </div>

        <div className={styles['review-card__rating-section']}>
          <div className={styles['review-card__stars']}>
            {renderStars()}
          </div>
          {isLocal && (
            <div className={styles['review-card__badge']}>
              <Image
                src="/images/all/check pago.svg"
                alt=""
                width={14}
                height={14}
              />
              <span className={styles['review-card__badge-text']}>Gusto!</span>
            </div>
          )}
        </div>
      </header>

      {/* Title */}
      {getTitle() && (
        <h4 className={styles['review-card__title']}>{getTitle()}</h4>
      )}

      {/* Content */}
      <div className={styles['review-card__content']}>
        <p className={styles['review-card__text']}>{getText()}</p>
      </div>

      {/* Images (campo images) */}
      {showImages && review.images && review.images.length > 0 && (
        <div className={styles['review-card__images']}>
          {review.images.map((image, index) => (
            <div key={index} className={styles['review-card__image']}>
              <Image
                src={image}
                alt={`Foto ${index + 1}`}
                width={200}
                height={200}
                className={styles['review-card__image-img']}
              />
            </div>
          ))}
        </div>
      )}

      {/* Fotos del review (campo fotos) */}
      {showImages && review.fotos && review.fotos.length > 0 && (
        <div className={styles['review-card__images']}>
          {review.fotos.map((foto, index) => {
            const url = typeof foto === 'string' ? foto : foto.url
            if (!url) return null

            return (
              <div key={index} className={styles['review-card__image']}>
                <Image
                  src={url}
                  alt={`Foto ${index + 1}`}
                  width={200}
                  height={200}
                  className={styles['review-card__image-img']}
                />
              </div>
            )
          })}
        </div>
      )}
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
  // Validación más robusta
  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
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
