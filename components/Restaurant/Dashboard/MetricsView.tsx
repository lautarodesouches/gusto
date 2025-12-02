import styles from './page.module.css'
import { Review } from '@/types'

type MetricCardData = {
    id: string
    label: string
    value: number
}

type Props = {
    loading: boolean
    isPremium: boolean
    metricCards: MetricCardData[]
    totalReviews: number
    displayedReviews: Review[]
    getReviewRating: (review: Review) => number
    getReviewText: (review: Review) => string
    getReviewDate: (review: Review) => string
    getReviewImage: (review: Review) => string | undefined
}

export default function MetricsView({
    loading,
    isPremium,
    metricCards,
    totalReviews,
    displayedReviews,
    getReviewRating,
    getReviewText,
    getReviewDate,
    getReviewImage,
}: Props) {
    return (
        <>
            {/* panel izquierdo: métricas */}
            <div className={styles.leftPanel}>
                {/* metricas / Premium */}
                <section className={styles.metricsCard}>
                    {loading ? (
                        <div className={styles.metricsLoading}>
                            Cargando métricas...
                        </div>
                    ) : !isPremium ? (
                        <div className={styles.metricsLocked}>
                            <p>PARA VER MÉTRICAS</p>
                            <p>
                                DESBLOQUEA EL{' '}
                                <span className={styles.highlight}>
                                    PREMIUM
                                </span>
                            </p>
                        </div>
                    ) : (
                        <div className={styles.metricsGrid}>
                            {metricCards.map(card => (
                                <article
                                    key={card.id}
                                    className={styles.metricCard}
                                >
                                    <h3 className={styles.metricTitle}>
                                        {card.label}
                                    </h3>
                                    <div className={styles.metricCircleWrapper}>
                                        <div className={styles.metricCircle}>
                                            <span className={styles.metricValue}>
                                                {card.value}
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Panel derecho: reseñas */}
            <aside className={styles.rightPanel}>
                <header className={styles.reviewsHeader}>
                    <h2>Reseñas</h2>
                    <span className={styles.reviewsCount}>
                        {totalReviews}
                    </span>
                </header>

                <div className={styles.reviewsList}>
                    {totalReviews === 0 ? (
                        <p className={styles.reviewsPlaceholder}>
                            Aquí se mostrarán las reseñas del
                            restaurante.
                        </p>
                    ) : (
                        <ul className={styles.reviewsItems}>
                            {displayedReviews.map(review => {
                                const rating = getReviewRating(review)
                                const text = getReviewText(review)
                                const date = getReviewDate(review)
                                const image = getReviewImage(review)

                                return (
                                    <li
                                        key={review.id}
                                        className={styles.reviewItem}
                                    >
                                        <div className={styles.reviewHeader}>
                                            <div className={styles.reviewHeaderMain}>
                                                <span className={styles.reviewAuthor}>
                                                    {review.autor}
                                                </span>
                                                {date && (
                                                    <span className={styles.reviewDate}>
                                                        {new Date(date).toLocaleDateString('es-AR')}
                                                    </span>
                                                )}
                                            </div>

                                            <div className={styles.reviewRatingWrapper}>
                                                <div className={styles.reviewStars}>
                                                    {Array.from({ length: 5 }).map((_, idx) => (
                                                        <span
                                                            key={idx}
                                                            className={
                                                                idx < rating
                                                                    ? styles.starFilled
                                                                    : styles.starEmpty
                                                            }
                                                        >
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                                <span className={styles.reviewRatingValue}>
                                                    {rating}
                                                </span>
                                            </div>
                                        </div>

                                        {image && (
                                            <div className={styles.reviewImageWrapper}>
                                                <img
                                                    src={image}
                                                    alt={`Foto de reseña de ${review.autor}`}
                                                    className={styles.reviewImage}
                                                />
                                            </div>
                                        )}

                                        {text && (
                                            <p className={styles.reviewText}>
                                                {text}
                                            </p>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </div>
            </aside>
        </>
    )
}
