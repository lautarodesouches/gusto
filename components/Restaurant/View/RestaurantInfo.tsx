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
                <div className={styles.data__subtitleContainer}>
                    <h3 className={styles.data__subtitle}>Acerca de</h3>
                    {explicacion && (
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="28" 
                            height="28" 
                            viewBox="0 0 24 24"
                            className={styles.data__aiIcon}
                            aria-label="Texto generado por inteligencia artificial"
                        >
                            <title>Texto generado por IA</title>
                            <g fill="none">
                                <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"/>
                                <path fill="currentColor" d="M9.107 5.448c.598-1.75 3.016-1.803 3.725-.159l.06.16l.807 2.36a4 4 0 0 0 2.276 2.411l.217.081l2.36.806c1.75.598 1.803 3.016.16 3.725l-.16.06l-2.36.807a4 4 0 0 0-2.412 2.276l-.081.216l-.806 2.361c-.598 1.75-3.016 1.803-3.724.16l-.062-.16l-.806-2.36a4 4 0 0 0-2.276-2.412l-.216-.081l-2.36-.806c-1.751-.598-1.804-3.016-.16-3.724l.16-.062l2.36-.806A4 4 0 0 0 8.22 8.025l.081-.216zM19 2a1 1 0 0 1 .898.56l.048.117l.35 1.026l1.027.35a1 1 0 0 1 .118 1.845l-.118.048l-1.026.35l-.35 1.027a1 1 0 0 1-1.845.117l-.048-.117l-.35-1.026l-1.027-.35a1 1 0 0 1-.118-1.845l.118-.048l1.026-.35l.35-1.027A1 1 0 0 1 19 2"/>
                            </g>
                        </svg>
                    )}
                </div>
                {restaurant.categoria && (
                    <p className={styles.data__info}>
                        <strong>Categoría:</strong> {formatCategory(restaurant.categoria)}
                    </p>
                )}
                {loadingExplicacion ? (
                    <div className={styles.data__info}>
                        <p>Generando descripción con IA...</p>
                    </div>
                ) : explicacion ? (
                    <div className={styles.data__info}>
                        <p>{explicacion}</p>
                    </div>
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
