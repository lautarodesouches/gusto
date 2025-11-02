'use client'
import Image from 'next/image'
import styles from './page.module.css'
import { Restaurant, Review } from '@/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faBookmark,
    faImage,
    faGlobe,
    faBuilding,
    faPen,
    faBell,
    faUser,
    faPhone,
    faEnvelope,
} from '@fortawesome/free-solid-svg-icons'
import { faBookmark as faBookmarkEmpty } from '@fortawesome/free-regular-svg-icons'
import Link from 'next/link'
import { formatPhoneAR } from '@/utils'
import RatingDistribution from '../Rating'
import ReviewList from '../Reviews'
import { ROUTES } from '@/routes'

interface Props {
    restaurant: Restaurant
    reviews: Review[]
    isFavourite: boolean
    onFavourite: () => void
}

export default function RestaurantView({
    restaurant,
    reviews,
    isFavourite,
    onFavourite,
}: Props) {
    const days = [
        { day: 'Domingo', hours: 'De 12:00 a 01:00' },
        { day: 'Lunes', hours: 'De 12:00 a 01:00' },
        { day: 'Martes', hours: 'De 12:00 a 01:00' },
        { day: 'Miércoles', hours: 'De 12:00 a 01:00' },
        { day: 'Jueves', hours: 'De 12:00 a 01:00' },
        { day: 'Viernes', hours: 'De 12:00 a 01:00' },
        { day: 'Sábado', hours: 'De 12:00 a 01:00' },
    ]

    const stars = []

    for (let i = 1; i <= 5; i++) {
        if (restaurant.rating >= i) {
            stars.push(
                <Image
                    src="/images/all/star.svg"
                    alt=""
                    width={30}
                    height={30}
                    className={styles.top__star}
                    key={i}
                />
            )
        } else if (restaurant.rating >= i - 0.5) {
            stars.push(
                <Image
                    src="/images/all/star-half.svg"
                    alt=""
                    width={30}
                    height={30}
                    className={styles.top__star}
                    key={i}
                />
            )
        } else {
            stars.push(
                <Image
                    src="/images/all/star-empty.svg"
                    alt=""
                    width={30}
                    height={30}
                    className={styles.top__star}
                    key={i}
                />
            )
        }
    }

    const sideItems = [
        { title: 'Interior', count: 8 },
        { title: 'Comida', count: 12 },
        { title: 'Menú', count: 5 },
    ]

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <div className={styles.header__div}>
                    <Link className={styles.header__link} href={ROUTES.MAP}>
                        <Image
                            className={styles.header__brand}
                            src="/images/brand/gusto-center-negative.svg"
                            alt="Logo Gusto!"
                            width={300}
                            height={200}
                            priority
                        />
                    </Link>
                </div>
                <div className={styles.header__div}>
                    <FontAwesomeIcon
                        className={styles.header__icon}
                        icon={faBell}
                    />
                    <FontAwesomeIcon
                        className={styles.header__icon}
                        icon={faUser}
                    />
                </div>
            </header>
            <section className={styles.top}>
                <header className={styles.top__header}>
                    <div className={styles.top__thumnailcontainer}>
                        <Image
                            src={`/images/all/poster.jpg`}
                            alt="Icono del restaurante"
                            width={200}
                            height={200}
                            className={styles.top__thumnail}
                        />
                    </div>
                    <div className={styles.top__info}>
                        <h2 className={styles.top__title}>
                            {restaurant.nombre}
                        </h2>
                        <div className={styles.top__rating}>
                            <span className={styles.top__number}>
                                {restaurant.rating.toFixed(1)}
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
                <div className={styles.gallery}>
                    {/* Imagen principal */}
                    <div className={styles.gallery__main}>
                        <Image
                            src={`/images/all/poster.jpg`}
                            className={styles.gallery__mainimage}
                            alt=""
                            width={800}
                            height={600}
                        />
                        <div className={styles.gallery__badge}>
                            <FontAwesomeIcon
                                icon={faImage}
                                className={styles.gallery__badgeicon}
                            />
                            <span>25</span>
                        </div>
                    </div>

                    {/* Columna lateral */}
                    <div className={styles['gallery__side']}>
                        {sideItems.map(item => (
                            <div
                                key={item.title}
                                className={styles['gallery__side-item']}
                            >
                                <Image
                                    className={styles['gallery__side-image']}
                                    src={`/images/all/poster.jpg`}
                                    alt={item.title}
                                    width={200}
                                    height={200}
                                />
                                <div className={styles['gallery__side-info']}>
                                    <span
                                        className={
                                            styles['gallery__side-title']
                                        }
                                    >
                                        {item.title}
                                    </span>
                                    <span
                                        className={
                                            styles['gallery__side-count']
                                        }
                                    >
                                        {item.count}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <nav className={styles.navbar}>
                <ul className={styles.navbar__ul}>
                    <li className={styles.navbar__li}>
                        <Link className={styles.navbar__link} href={`#`}>
                            Descripcion General
                        </Link>
                    </li>
                    <li className={styles.navbar__li}>
                        <Link
                            className={styles.navbar__link}
                            href={`#horarios`}
                        >
                            Horarios
                        </Link>
                    </li>
                    <li className={styles.navbar__li}>
                        <Link
                            className={styles.navbar__link}
                            href={`#ubicacion`}
                        >
                            Ubicación
                        </Link>
                    </li>
                    <li className={styles.navbar__li}>
                        <Link
                            className={styles.navbar__link}
                            href={`#opiniones`}
                        >
                            Opiniones
                        </Link>
                    </li>
                </ul>
            </nav>
            <section className={styles.info}>
                <div className={styles.data}>
                    <h3 className={styles.data__title}>
                        Un vistazo al restuarante
                    </h3>
                    <p className={styles.data__open}>Abierto hasta las 01:00</p>
                    <ul className={styles.data__list}>
                        <li className={styles.data__item}>
                            <FontAwesomeIcon
                                className={styles.data__icon}
                                icon={faGlobe}
                            />
                            <Link className={styles.data__link} href={''}>
                                Pagina web
                            </Link>
                        </li>
                        <li className={styles.data__item}>
                            <FontAwesomeIcon
                                className={styles.data__icon}
                                icon={faPhone}
                            />
                            <Link
                                className={styles.data__link}
                                href={`tel:541112345678`}
                            >
                                {formatPhoneAR(`+541112345678`)}
                            </Link>
                        </li>
                        <li className={styles.data__item}>
                            <FontAwesomeIcon
                                className={styles.data__icon}
                                icon={faEnvelope}
                            />
                            <Link
                                className={styles.data__link}
                                href={`mailto:contacto@empresa.com`}
                            >
                                contacto@empresa.com
                            </Link>
                        </li>
                    </ul>
                    <h3 className={styles.data__subtitle}>Acerca de</h3>
                    <p className={styles.data__info}>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Repellendus aliquam ex odio tempore in, enim cum quasi.
                        Voluptas omnis exercitationem sunt aperiam, ducimus
                        placeat explicabo iste in ipsam est velit. Deleniti
                        eveniet nostrum asperiores incidunt molestiae ad quo
                        voluptas magnam. Similique quas animi deserunt tenetur
                        dignissimos pariatur, eius ex illo repellat alias at
                        reiciendis, fugit placeat debitis autem laborum harum.
                        Cupiditate culpa, at accusantium ipsa nam, hic expedita
                        exercitationem, unde cumque ducimus nobis voluptatum?
                        Deserunt voluptates, reiciendis itaque eos, culpa
                        officia ea asperiores ab quisquam et velit odit. Eum,
                        ratione.
                    </p>
                </div>
                <div className={styles.hours}>
                    <h3 className={styles.hours__title}>
                        Guardar este restaurante
                    </h3>
                    <button
                        className={styles.hours__button}
                        onClick={onFavourite}
                    >
                        <FontAwesomeIcon
                            className={styles.hours__icon}
                            icon={isFavourite ? faBookmark : faBookmarkEmpty}
                        />
                        {isFavourite ? 'Eliminar de guardados' : 'Guardar'}
                    </button>
                    <div className={styles.hours__div} id="horarios">
                        <h4 className={styles.hours__subtile}>Horas</h4>
                        <p className={styles.hours__text}>
                            Abierto hasta las 01:00
                        </p>
                        <ul className={styles.hours__ul}>
                            {days.map(item => (
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
            </section>
            <section className={styles.location} id="ubicacion">
                <header className={styles.location__header}>
                    <div className={styles.location__div}>
                        <h3 className={styles.location__title}>Ubicación</h3>
                    </div>
                    <div className={styles.location__div}>
                        <FontAwesomeIcon
                            className={styles.location__icon}
                            icon={faBuilding}
                        />
                        <span className={styles.location__span}>Localidad</span>
                    </div>
                </header>
                <div className={styles.location__map}></div>
            </section>
            <section className={styles.rating} id="opiniones">
                <RatingDistribution
                    data={{
                        excelente: 10,
                        bueno: 7,
                        promedio: 5,
                        malo: 2,
                        horrible: 1,
                    }}
                    rating={4.5}
                />
                <div className={styles.rating__div}>
                    <h4 className={styles.rating__title}>Opinión</h4>
                    <button className={styles.rating__button}>
                        <FontAwesomeIcon
                            className={styles.rating__icon}
                            icon={faPen}
                        />
                        Escribir una opinión
                    </button>
                </div>
            </section>
            <section className={styles.images}>
                <h4 className={styles.images__subtitle}>Fotos de usuarios</h4>
                <ul className={styles.images__list}>
                    <li className={styles.images__item}>
                        <Image
                            className={styles.images__image}
                            src={`/images/all/poster.jpg`}
                            alt=""
                            width={100}
                            height={100}
                        />
                    </li>
                </ul>
            </section>
            <section className={styles.opinions}>
                <h3 className={styles.opinions__title}>
                    Todas las opiniones (54)
                </h3>
                <p className={styles.opinions__text}>
                    Las opiniones son valoraciones subjetivas de miembros de{' '}
                    <span className={styles.opinions__brand}>Gusto!</span>
                </p>
                <ReviewList reviews={reviews} />
            </section>
        </main>
    )
}
