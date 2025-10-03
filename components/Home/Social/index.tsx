import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './page.module.css'
import { faClose, faInfo, faUser } from '@fortawesome/free-solid-svg-icons'

interface Props {
    isVisible: boolean
    handleClose: () => void
    friends: { image: string; name: string; user: string }[]
    groups: { name: string; numberOfMembers: number }[]
}

export default function Social({
    friends,
    groups,
    isVisible,
    handleClose,
}: Props) {
    return (
        <section className={`${styles.social} ${isVisible ? styles.show : ''}`}>
            <header className={styles.social__header}>
                <h2 className={styles.social__title}>Social</h2>
                <FontAwesomeIcon
                    icon={faClose}
                    className={styles.social__close}
                    onClick={handleClose}
                />
            </header>
            <div className={styles.social__buttons}>
                <button className={styles.social__button}>Añadir amigo</button>
                <button className={styles.social__button}>Crear grupo</button>
            </div>
            <div className={styles.social__div}>
                <h3 className={styles.social__title}>Amigos</h3>
                <hr className={styles.social__line} />
                <ul className={styles.social__list}>
                    {friends.map(u => (
                        <li className={styles.user} key={u.user}>
                            <div className={styles.user__img}>
                                <FontAwesomeIcon
                                    icon={faUser}
                                    className={styles.user__icon}
                                />
                            </div>
                            <div className={styles.user__data}>
                                <p className={styles.user__name}>{u.name}</p>
                                <p className={styles.user__user}>{u.user}</p>
                            </div>
                            <div className={styles.user__info}>
                                <FontAwesomeIcon
                                    icon={faInfo}
                                    className={styles.user__icon}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className={styles.social__div}>
                <h3 className={styles.social__title}>Grupos</h3>
                <hr className={styles.social__line} />
                <ul className={styles.social__list}>
                    {groups.map(g => (
                        <li className={styles.group} key={g.name}>
                            <div className={styles.group__img}>
                                <FontAwesomeIcon
                                    icon={faUser}
                                    className={styles.group__icon}
                                />
                            </div>
                            <div className={styles.group__data}>
                                <p className={styles.group__name}>{g.name}</p>
                                <p className={styles.group__number}>
                                    {g.numberOfMembers}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
