'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'
import Link from 'next/link'
import { ROUTES } from '@/routes'
import NotificationBell from '@/components/NotificationBell/Notificacion'
import { User } from '@/types'
import styles from './styles.module.css'

interface Props {
    profile: User
    username: string
    email: string
    isPrivate: boolean
    activeTab: 'perfil' | 'guardados'
    onUsernameChange: (username: string) => void
    onIsPrivateChange: (isPrivate: boolean) => void
    onActiveTabChange: (tab: 'perfil' | 'guardados') => void
    onSave: () => void
    onBack: () => void
}

export default function ProfileConfigView({
    profile,
    username,
    email,
    isPrivate,
    activeTab,
    onUsernameChange,
    onIsPrivateChange,
    onActiveTabChange,
    onSave,
    onBack,
}: Props) {
    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.header__left}>
                    <Link href={ROUTES.HOME} className={styles.header__logo}>
                        <span className={styles.header__logoText}>GUSTO!</span>
                        <span className={styles.header__tagline}>
                            Decidir dónde comer, juntos
                        </span>
                    </Link>
                </div>
                <div className={styles.header__center}>
                    <h1 className={styles.header__title}>
                        Configuración del perfil
                    </h1>
                </div>
                <div className={styles.header__right}>
                    <NotificationBell />
                    <Link href={`${ROUTES.PROFILE}${profile.username}`}>
                        <FontAwesomeIcon
                            icon={faUser}
                            className={styles.header__icon}
                        />
                    </Link>
                </div>
            </header>

            <div className={styles.content}>
                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <button
                        className={`${styles.sidebar__button} ${
                            activeTab === 'perfil' ? styles.sidebar__buttonActive : ''
                        }`}
                        onClick={() => onActiveTabChange('perfil')}
                    >
                        Perfil
                    </button>
                    <button
                        className={`${styles.sidebar__button} ${
                            activeTab === 'guardados' ? styles.sidebar__buttonActive : ''
                        }`}
                        onClick={() => onActiveTabChange('guardados')}
                    >
                        Guardados
                    </button>
                    <button
                        className={styles.sidebar__back}
                        onClick={onBack}
                    >
                        Volver atrás
                    </button>
                </aside>

                {/* Main Content */}
                <main className={styles.main}>
                    {activeTab === 'perfil' ? (
                        <>
                            {/* Profile Images */}
                            <div className={styles.profileImages}>
                                <div className={styles.profileImages__banner}>
                                    {/* Banner placeholder */}
                                </div>
                                <div className={styles.profileImages__avatar}>
                                    {profile.fotoPerfilUrl ? (
                                        <Image
                                            src={profile.fotoPerfilUrl}
                                            alt={profile.username}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <FontAwesomeIcon
                                            icon={faUser}
                                            className={styles.profileImages__avatarIcon}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* User Information */}
                            <div className={styles.form}>
                                <div className={styles.form__field}>
                                    <label className={styles.form__label}>
                                        Nombre de Usuario
                                    </label>
                                    <input
                                        type="text"
                                        className={styles.form__input}
                                        value={username}
                                        onChange={e => onUsernameChange(e.target.value)}
                                        placeholder="Nombre de usuario"
                                    />
                                </div>

                                <div className={styles.form__field}>
                                    <label className={styles.form__label}>
                                        Correo Electrónico
                                    </label>
                                    <input
                                        type="email"
                                        className={styles.form__input}
                                        value={email}
                                        disabled
                                        placeholder="Correo electrónico"
                                    />
                                </div>

                                {/* Account Privacy */}
                                <div className={styles.privacy}>
                                    <h2 className={styles.privacy__title}>
                                        Privacidad de la cuenta
                                    </h2>
                                    <div className={styles.privacy__toggle}>
                                        <label className={styles.privacy__label}>
                                            Cuenta Privada
                                        </label>
                                        <button
                                            type="button"
                                            className={`${styles.toggle} ${
                                                isPrivate ? styles.toggleActive : ''
                                            }`}
                                            onClick={() => onIsPrivateChange(!isPrivate)}
                                        >
                                            <span className={styles.toggle__slider} />
                                        </button>
                                    </div>
                                    <ul className={styles.privacy__list}>
                                        <li>
                                            Si tu cuenta es pública, cualquier persona
                                            dentro podrá ver tu perfil (gustos, lugares
                                            visitados, etc)
                                        </li>
                                        <li>
                                            Si tu cuenta es privada solo amigos que
                                            tengas agregados podrán ver tu perfil
                                        </li>
                                    </ul>
                                </div>

                                <button
                                    className={styles.form__save}
                                    onClick={onSave}
                                >
                                    Guardar cambios
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className={styles.saved}>
                            <h2 className={styles.saved__title}>Restaurantes Guardados</h2>
                            <p className={styles.saved__empty}>
                                No tienes restaurantes guardados aún
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

