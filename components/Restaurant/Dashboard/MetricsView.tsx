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
    getReviewAuthorImage: (review: Review) => string | undefined
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
    getReviewAuthorImage,
}: Props) {
    // Calculate analytics data
    const reviews = displayedReviews.slice(0, 5) // Show only first 5
    const ratings = reviews.map(r => getReviewRating(r))
    const avgRating = ratings.length > 0
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : '0.0'

    return (
        <>
            {/* Metrics / Premium */}
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
                    <div className={styles.metricsContainer}>
                        {/* Destacados Section */}
                        <div className={styles.metricsContainer__section}>
                            <h2 className={styles.metricsContainer__title}>Destacados</h2>
                            <div className={styles.destacados__grid}>
                                <div className={styles.destacados__card}>
                                    <span className={styles.destacados__label}>Individual</span>
                                    <span className={styles.destacados__value}>{metricCards[0].value}</span>
                                </div>
                                <div className={styles.destacados__card}>
                                    <span className={styles.destacados__label}>En Grupos</span>
                                    <span className={styles.destacados__value}>{metricCards[1].value}</span>
                                </div>
                            </div>
                            <p className={styles.destacados__note}>
                                *Veces en el Top 3 recomendado por nuestro algoritmo
                            </p>
                        </div>

                        {/* Visitantes Section */}
                        <div className={styles.metricsContainer__section}>
                            <h2 className={styles.metricsContainer__title}>Visitas al Perfil</h2>
                            <div className={styles.visitantes}>
                                <span className={styles.visitantes__value}>{metricCards[2].value}</span>
                            </div>
                        </div>

                        {/* Review Analytics */}
                        {reviews.length > 0 && (
                            <div className={styles.metricsContainer__section}>
                                <h2 className={styles.metricsContainer__title}>Análisis de Reseñas</h2>
                                <div className={styles.reviewAnalytics}>
                                    {/* Average Rating */}
                                    <div className={styles.reviewAnalytics__chart}>
                                        <div className={styles.avgRating}>
                                            <div className={styles.avgRating__value}>
                                                {avgRating}
                                            </div>
                                            <div className={styles.avgRating__max}>/5.0</div>
                                            <div className={styles.avgRating__stars}>
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <span key={i}>★</span>
                                                ))}
                                            </div>
                                            <div className={styles.reviewAnalytics__chartSubtitle}>
                                                Promedio de {reviews.length} reseñas
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rating Distribution */}
                                    <div className={styles.reviewAnalytics__chart}>
                                        <div className={styles.reviewAnalytics__chartTitle}>Distribución</div>
                                        {[5, 4, 3, 2, 1].map(stars => {
                                            const count = reviews.filter(r => getReviewRating(r) === stars).length
                                            const percentage = reviews.length > 0
                                                ? (count / reviews.length) * 100
                                                : 0
                                            return (
                                                <div key={stars} className={styles.ratingDist__bar}>
                                                    <span className={styles.ratingDist__label}>{stars} ★</span>
                                                    <div className={styles.ratingDist__barTrack}>
                                                        <div
                                                            className={styles.ratingDist__barFill}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className={styles.ratingDist__count}>{count}</span>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Reviews Timeline */}
                                    <div className={styles.reviewAnalytics__chart}>
                                        <div className={styles.reviewAnalytics__chartTitle}>Últimos 7 días</div>
                                        <div className={styles.reviewsTimeline__bars}>
                                            {(() => {
                                                const last7Days = Array.from({ length: 7 }, (_, i) => {
                                                    const date = new Date()
                                                    date.setDate(date.getDate() - (6 - i))
                                                    return date
                                                })

                                                const reviewsByDay = last7Days.map(date => {
                                                    const dateStr = date.toISOString().split('T')[0]
                                                    const count = reviews.filter(r => {
                                                        const reviewDate = getReviewDate(r)
                                                        return reviewDate && reviewDate.startsWith(dateStr)
                                                    }).length
                                                    return { date, count }
                                                })

                                                const maxCount = Math.max(...reviewsByDay.map(d => d.count), 1)

                                                return reviewsByDay.map(({ count }, idx) => {
                                                    const height = (count / maxCount) * 100
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={styles.reviewsTimeline__bar}
                                                            style={{ height: `${height}%` }}
                                                        >
                                                            <span className={styles.reviewsTimeline__barValue}>{count}</span>
                                                        </div>
                                                    )
                                                })
                                            })()}
                                        </div>
                                        <div className={styles.reviewsTimeline__labels}>
                                            {Array.from({ length: 7 }, (_, i) => {
                                                const date = new Date()
                                                date.setDate(date.getDate() - (6 - i))
                                                return <span key={i}>{date.getDate()}/{date.getMonth() + 1}</span>
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Reviews Section */}
            <section>
                <header className={styles.reviewsHeader}>
                    <h2>Reseñas recientes</h2>
                    <span className={styles.reviewsCount}>
                        {totalReviews}
                    </span>
                </header>

                <div className={styles.reviewsList}>
                    {totalReviews === 0 ? (
                        <p className={styles.reviewsPlaceholder}>
                            Aquí se mostrarán las reseñas del restaurante.
                        </p>
                    ) : (
                        <ul className={styles.reviewsItems}>
                            {reviews.map(review => {
                                const rating = getReviewRating(review)
                                const text = getReviewText(review)
                                const date = getReviewDate(review)
                                const image = getReviewImage(review)
                                const authorImage = getReviewAuthorImage(review)

                                return (
                                    <li
                                        key={review.id}
                                        className={styles.reviewItem}
                                    >
                                        <div className={styles.reviewHeader}>
                                            <div className={styles.reviewHeaderMain}>
                                                <div className={styles.reviewAuthorWrapper}>
                                                    {authorImage && (
                                                        <img
                                                            src={authorImage}
                                                            alt={review.autor}
                                                            className={styles.reviewAuthorImage}
                                                        />
                                                    )}
                                                    <span className={styles.reviewAuthor}>
                                                        {review.autor}
                                                    </span>
                                                </div>
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
            </section>
        </>
    )
}
