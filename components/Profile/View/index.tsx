'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faArrowLeft,
    faLocationDot,
    faPlus,
    faUser,
    faUserMinus,
    faUserPlus,
} from '@fortawesome/free-solid-svg-icons'
import styles from './page.module.css'
import { User } from '@/types'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/routes'

interface ProfileViewProps {
    profile: User
    isOwnProfile: boolean
    isFriend: boolean
    onEdit: () => void
}

export function ProfileView({
    profile,
    isOwnProfile,
    isFriend,
    onEdit,
}: ProfileViewProps) {
    const router = useRouter()

    const handleEditTastes = () => {
        router.push(`${ROUTES.STEPS}/3`)
    }

    const handleGoPlace = (lat: number, lng: number) => {
        router.push(`${ROUTES.MAP}?near.lat=${lat}&near.lng=${lng}`)
    }

    const handleGoBack = () => {
        router.back()
    }

    return (
        <article className={styles.profile}>
            <header className={styles.header}>
                <Image
                    className={styles.header__img}
                    src={`/images/all/stars.jpg`}
                    alt=""
                    width={1200}
                    height={600}
                />
            </header>
            <section className={styles.info}>
                <div className={styles.info__div}>
                    <div className={styles.info__container}>
                        {profile.fotoPerfilUrl ? (
                            <Image
                                className={styles.info__img}
                                src={profile.fotoPerfilUrl}
                                alt="foto de perfil"
                                width={400}
                                height={200}
                            />
                        ) : (
                            <FontAwesomeIcon
                                className={styles.info__img}
                                icon={faUser}
                            />
                        )}
                    </div>
                </div>
                <div className={styles.info__div}>
                    <h2 className={styles.info__title}>
                        {profile.nombre} {profile.apellido}
                    </h2>
                    <h3 className={styles.info__subtitle}>
                        {profile.username}
                    </h3>
                </div>
            </section>
            <div className={styles.container}>
                <section className={styles.tastes}>
                    <h3 className={styles.tastes__title}>
                        Gustos{' '}
                        <span className={styles.tastes__span}>
                            - {profile.gustos.length}
                        </span>
                    </h3>
                    <hr className={styles.container__line} />
                    <ul className={styles.tastes__list}>
                        {profile.gustos.map(taste => (
                            <li className={styles.tastes__item} key={taste.id}>
                                {taste.nombre}
                            </li>
                        ))}
                        {isOwnProfile && (
                            <FontAwesomeIcon
                                className={styles.tastes__edit}
                                icon={faPlus}
                                onClick={handleEditTastes}
                            />
                        )}
                    </ul>
                </section>
                <section className={styles.visited}>
                    <h3 className={styles.visited__title}>Lugares visitados</h3>
                    <hr className={styles.container__line} />
                    <ul className={styles.visited__list}>
                        {profile.visitados.map(place => (
                            <li className={styles.visited__item} key={place.id}>
                                <p className={styles.visited__text}>
                                    {place.nombre}
                                </p>
                                <FontAwesomeIcon
                                    className={styles.visited__icon}
                                    icon={faLocationDot}
                                    onClick={() =>
                                        handleGoPlace(place.lat, place.lng)
                                    }
                                />
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
            <footer className={styles.footer}>
                {!isOwnProfile && (
                    <>
                        {isFriend ? (
                            <button className={styles.footer__delete}>
                                <FontAwesomeIcon
                                    className={styles.footer__icon}
                                    icon={faUserMinus}
                                />{' '}
                                Eliminar de amigos
                            </button>
                        ) : (
                            <button className={styles.footer__add}>
                                <FontAwesomeIcon
                                    className={styles.footer__icon}
                                    icon={faUserPlus}
                                />{' '}
                                Agregar a amigos
                            </button>
                        )}
                    </>
                )}
            </footer>
            <aside className={styles.aside}>
                <button className={styles.aside__button}>
                    <FontAwesomeIcon
                        className={styles.aside__icon}
                        icon={faArrowLeft}
                        onClick={handleGoBack}
                    />
                </button>
            </aside>
        </article>
    )
}
