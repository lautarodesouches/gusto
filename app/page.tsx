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
            <nav>
                <fieldset>
                    <FontAwesomeIcon icon={faSearch} />
                    <input type="text" />
                </fieldset>
                <div>
                    <button>
                        <FontAwesomeIcon icon={faBell} />
                    </button>
                </div>
            </nav>
            <div></div>
            <div>
                <div>
                    <FontAwesomeIcon icon={faFilter} />
                    <span>Filtros</span>
                </div>
                <div>
                    <FontAwesomeIcon icon={faUsers} />
                    <span>Social</span>
                </div>
                <div>
                    <span>LD</span>
                </div>
            </div>
        </main>
    )
}
