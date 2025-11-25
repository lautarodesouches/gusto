'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faLocationDot,
    faLock,
    faPlus,
    faUser,
    faUserMinus,
    faUserPlus,
} from '@fortawesome/free-solid-svg-icons'
import styles from './page.module.css'
import { User } from '@/types'
import Image from 'next/image'

interface ProfileViewProps {
    profile: User
    isPending?: boolean
    onAddFriend?: () => void
    onDeleteFriend?: () => void
    onEditTastes: () => void
    onGoPlace: (lat: number, lng: number) => void
    onGoBack: () => void
}

export function ProfileView({
    profile,
    isPending,
    onDeleteFriend,
    onAddFriend,
    onEditTastes,
    onGoPlace,
}: ProfileViewProps) {
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
                            <img
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
                {profile.esPrivado ? (
                    <section className={styles.private}>
                        <FontAwesomeIcon
                            icon={faLock}
                            className={styles.private__icon}
                        />
                        <h2 className={styles.private__title}>
                            Perfil Privado
                        </h2>
                        <p className={styles.private__text}>
                            Este perfil se encuentra en privado
                        </p>
                    </section>
                ) : (
                    <>
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
                                    <li
                                        className={styles.tastes__item}
                                        key={taste.id}
                                    >
                                        {taste.nombre}
                                    </li>
                                ))}
                                {profile.esMiPerfil && (
                                    <FontAwesomeIcon
                                        className={styles.tastes__edit}
                                        icon={faPlus}
                                        onClick={onEditTastes}
                                    />
                                )}
                            </ul>
                        </section>
                        <section className={styles.visited}>
                            <h3 className={styles.visited__title}>
                                Lugares visitados
                            </h3>
                            <hr className={styles.container__line} />
                            {!profile.visitados || profile.visitados.length === 0 ? (
                                <div className={styles.visited__empty}>
                                    <p className={styles.visited__empty_text}>
                                        No visitaste ningún lugar, ¿querés ir a alguno?
                                    </p>
                                </div>
                            ) : (
                                <ul className={styles.visited__list}>
                                    {profile.visitados.map(place => (
                                        <li
                                            className={styles.visited__item}
                                            key={place.id}
                                        >
                                            <p className={styles.visited__text}>
                                                {place.nombre}
                                            </p>
                                            <FontAwesomeIcon
                                                className={styles.visited__icon}
                                                icon={faLocationDot}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </>
                )}
            </div>
            <footer className={styles.footer}>
                {!profile.esMiPerfil && (
                    <>
                        {profile.esAmigo ? (
                            <button
                                className={styles.footer__delete}
                                onClick={onDeleteFriend}
                                disabled={isPending}
                            >
                                <FontAwesomeIcon
                                    className={styles.footer__icon}
                                    icon={faUserMinus}
                                />{' '}
                                Eliminar de amigos
                            </button>
                        ) : (
                            <button
                                className={styles.footer__add}
                                onClick={onAddFriend}
                                disabled={isPending}
                            >
                                <FontAwesomeIcon
                                    className={styles.footer__icon}
                                    icon={faUserPlus}
                                />{' '}
                                {isPending ? 'Enviando...' : 'Agregar amigo'}
                            </button>
                        )}
                    </>
                )}
            </footer>
        </article>
    )
}
