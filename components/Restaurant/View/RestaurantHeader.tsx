import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark } from '@fortawesome/free-solid-svg-icons'
import { faBookmark as faBookmarkEmpty } from '@fortawesome/free-regular-svg-icons'
import { Restaurant } from '@/types'
import styles from './page.module.css'
import { getSafeImageUrl } from './utils'

interface Props {
    restaurant: Restaurant
    isFavourite: boolean
    onFavourite: () => void
    stars: React.ReactNode[]
    rating: number
}

export default function RestaurantHeader({
    restaurant,
    isFavourite,
    onFavourite,
    stars,
    rating,
}: Props) {
    return (
        <header className={styles.top__header}>
            <div className={styles.top__thumnailcontainer}>
                <Image
                    src={getSafeImageUrl(
                        restaurant.esDeLaApp 
                            ? (restaurant.logoUrl || restaurant.imagenUrl)
                            : restaurant.imagenUrl,
                        `/images/restaurant/logo.png`
                    )}
                    alt="Icono del restaurante"
                    width={200}
                    height={200}
                    className={styles.top__thumnail}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/images/restaurant/logo.png'
                    }}
                />
            </div>
            <div className={styles.top__info}>
                <h2 className={styles.top__title}>
                    {restaurant.nombre}
                </h2>
                <div className={styles.top__rating}>
                    <span className={styles.top__number}>
                        {rating > 0 ? rating.toFixed(1) : 'N/A'}
                    </span>
                    <div className={styles.top__stars}>{stars}</div>
                </div>
            </div>
            <div className={styles.top__aside}>
                <button
                    className={styles.top__button}
                    onClick={onFavourite}
                >
                    <FontAwesomeIcon
                        className={styles.top__icon}
                        icon={
                            isFavourite ? faBookmark : faBookmarkEmpty
                        }
                    />
                    {isFavourite ? 'Eliminar de guardados' : 'Guardar'}
                </button>
            </div>
        </header>
    )
}
