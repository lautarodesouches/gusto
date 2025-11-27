import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGlobe } from '@fortawesome/free-solid-svg-icons'
import { Restaurant } from '@/types'
import styles from './page.module.css'
import { formatCategory } from '@/utils/categories'
import { ScheduleItem, OpenStatus } from './utils'

interface Props {
    restaurant: Restaurant
    horarios: ScheduleItem[]
    estadoActual: OpenStatus
    explicacion: string | null
    loadingExplicacion: boolean
}

export default function RestaurantInfo({
    restaurant,
    horarios,
    estadoActual,
    explicacion,
    loadingExplicacion,
}: Props) {
    return (
        <section className={styles.info} id="descripcion">
            <div className={styles.data}>
                <h3 className={styles.data__title}>
                    Un vistazo al restuarante
                </h3>
                {restaurant.esDeLaApp && horarios.length > 0 && (
                    <p className={styles.data__open} style={{ color: estadoActual.color }}>
                        {estadoActual.mensaje}
                    </p>
                )}
                <ul className={styles.data__list}>
                    {restaurant.webUrl && (
                        <li className={styles.data__item}>
                            <FontAwesomeIcon
                                className={styles.data__icon}
                                icon={faGlobe}
                            />
                            <Link 
                                className={styles.data__link} 
                                href={restaurant.webUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Página web
                            </Link>
                        </li>
                    )}

                </ul>
                <h3 className={styles.data__subtitle}>Acerca de</h3>
                {restaurant.categoria && (
                    <p className={styles.data__info}>
                        <strong>Categoría:</strong> {formatCategory(restaurant.categoria)}
                    </p>
                )}
                {loadingExplicacion ? (
                    <p className={styles.data__info}>
                        Cargando recomendación...
                    </p>
                ) : explicacion ? (
                    <p className={styles.data__info}>
                        {explicacion}
                    </p>
                ) : (
                    <p className={styles.data__info}>
                        {restaurant.esDeLaApp 
                            ? 'Restaurante registrado en la aplicación. Disfruta de información detallada, menú y reseñas de la comunidad.'
                            : 'Restaurante de Google Places. Información actualizada desde Google Maps.'}
                    </p>
                )}
                
            </div>
            {restaurant.esDeLaApp && horarios.length > 0 && (
                <div className={styles.hours}>
                    <div className={styles.hours__div} id="horarios">
                        <h4 className={styles.hours__subtile}>Horarios</h4>
                        <ul className={styles.hours__ul}>
                            {horarios.map(item => (
                                <li
                                    key={item.day}
                                    className={styles.schedule__item}
                                >
                                    <span className={styles.schedule__day}>
                                        {item.day}
                                    </span>
                                    <span className={styles.schedule__hours}>
                                        {item.hours}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </section>
    )
}
