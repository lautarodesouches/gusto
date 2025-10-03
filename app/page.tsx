import styles from './page.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faBell,
    faFilter,
    faSearch,
    faUsers,
} from '@fortawesome/free-solid-svg-icons'

export default function Home() {
    return (
        <main className={styles.main}>
            <nav className={styles.nav}>
                <fieldset className={styles.nav__fieldset}>
                    <FontAwesomeIcon
                        icon={faSearch}
                        className={styles.nav__icon}
                    />
                    <input type="text" className={styles.nav__input} />
                </fieldset>
                <div className={styles.nav__div}>
                    <FontAwesomeIcon
                        icon={faBell}
                        className={styles.nav__icon}
                    />
                </div>
            </nav>
            <div className={styles.map}></div>
            <div className={styles.bottom}>
                <div className={styles.bottom__container}>
                    <div className={styles.bottom__div}>
                        <FontAwesomeIcon
                            icon={faFilter}
                            className={styles.bottom__icon}
                        />
                        <span>Filtros</span>
                    </div>
                    <div className={styles.bottom__div}>
                        <FontAwesomeIcon
                            icon={faUsers}
                            className={styles.bottom__icon}
                        />
                        <span>Social</span>
                    </div>
                    <div className={styles.bottom__div}>
                        <span>LD</span>
                    </div>
                </div>
                <div className={styles.bottom__filter}></div>
                <div className={styles.bottom__social}></div>
            </div>
        </main>
    )
}
