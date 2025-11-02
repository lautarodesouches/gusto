import Image from 'next/image'
import styles from './styles.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faSearch, faUser } from '@fortawesome/free-solid-svg-icons'

export default function Nav() {
    return (
        <nav className={styles.nav}>
                <div className={styles.nav__logo}>
                    <Image
                        src="/images/brand/gusto-center-negative.svg"
                        alt="Logo Gusto!"
                        className={styles.nav__img}
                        width={0}
                        height={0}
                        priority
                    />
                </div>
                <fieldset className={styles.nav__fieldset}>
                    <FontAwesomeIcon
                        icon={faSearch}
                        className={styles.nav__icon}
                    />
                    <input
                        type="text"
                        placeholder="Escribe un lugar"
                        name="search"
                        className={styles.nav__input}
                    />
                </fieldset>
                <div className={styles.nav__icons}>
                    <div className={styles.nav__div}>
                        <FontAwesomeIcon
                            icon={faBell}
                            className={styles.nav__icon}
                        />
                    </div>
                    <div className={styles.nav__div}>
                        <FontAwesomeIcon
                            icon={faUser}
                            className={styles.nav__icon}
                        />
                    </div>
                </div>
            </nav>
    )
}