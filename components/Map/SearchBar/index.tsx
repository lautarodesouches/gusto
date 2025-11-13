'use client'
import styles from './styles.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

export default function SearchBar() {
    return (
        <div className={styles.buscador}>
            <div className={styles.buscador__campo}>
                <FontAwesomeIcon icon={faSearch} className={styles.buscador__icono} />
                <input
                    type="text"
                    placeholder="Escribe un lugar"
                    name="search"
                    className={styles.buscador__input}
                />
            </div>
        </div>
    )
}
