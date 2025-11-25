import styles from './page.module.css'

interface RatingData {
    excelente: number
    bueno: number
    promedio: number
    malo: number
    horrible: number
}

interface RatingDistributionProps {
    rating: number
    data: RatingData
    ratingLabel?: string
}

export default function RatingDistribution({ 
    rating, 
    data,
    ratingLabel = 'Muy Bueno'
}: RatingDistributionProps) {
    const total = data.excelente + data.bueno + data.promedio + data.malo + data.horrible

    const calculatePercentage = (value: number): number => {
        if (total === 0) return 0
        return (value / total) * 100
    }

    const ratings = [
        { label: 'Excelente', value: data.excelente, modifier: 'excelente' },
        { label: 'Bueno', value: data.bueno, modifier: 'bueno' },
        { label: 'Promedio', value: data.promedio, modifier: 'promedio' },
        { label: 'Malo', value: data.malo, modifier: 'malo' },
        { label: 'Horrible', value: data.horrible, modifier: 'horrible' },
    ]

    return (
        <div className={styles['rating-distribution']}>
            {/* Calificación general */}
            <div className={styles['rating-distribution__summary']}>
                <div className={styles['rating-distribution__score']}>
                    {rating.toFixed(1).replace('.', ',')}
                </div>
                <div className={styles['rating-distribution__label']}>
                    {ratingLabel}
                </div>
            </div>

            {/* Barras de distribución - Solo mostrar si hay opiniones */}
            {total > 0 && (
                <div className={styles['rating-distribution__bars']}>
                    {ratings.map((item) => {
                        const percentage = calculatePercentage(item.value)
                        
                        return (
                            <div 
                                key={item.label} 
                                className={styles['rating-distribution__row']}
                            >
                                <span className={styles['rating-distribution__row-label']}>
                                    {item.label}
                                </span>
                                
                                <div className={styles['rating-distribution__bar']}>
                                    <div 
                                        className={`${styles['rating-distribution__bar-fill']} ${styles[`rating-distribution__bar-fill--${item.modifier}`]}`}
                                        style={{ width: `${percentage}%` }}
                                        role="progressbar"
                                        aria-valuenow={item.value}
                                        aria-valuemin={0}
                                        aria-valuemax={total}
                                        aria-label={`${item.label}: ${item.value} opiniones`}
                                    />
                                </div>
                                
                                <span className={styles['rating-distribution__row-value']}>
                                    {item.value.toLocaleString('es-ES')}
                                </span>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}