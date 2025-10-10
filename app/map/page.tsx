'use client'
import styles from './page.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faBell,
    faFilter,
    faSearch,
    faUser,
    faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { HomeFilter, HomeSocial, MapView } from '@/components'
import { useState } from 'react'
import { MapProvider } from '@/components/Home/MapProvider'

export default function Map() {
    const [isFiltersVisible, setIsFiltersVisible] = useState(false)
    const [isSocialVisible, setIsSocialVisible] = useState(false)

    const handleClickFilters = () => {
        setIsFiltersVisible(prev => !prev) // alterna filtros
        setIsSocialVisible(false) // cierra social
    }

    const handleClickSocial = () => {
        setIsSocialVisible(prev => !prev) // alterna social
        setIsFiltersVisible(false) // cierra filtros
    }

    return (
        <main className={styles.main}>
            <nav className={styles.nav}>
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
            </nav>
            <MapProvider>
                <MapView />
            </MapProvider>
            <section className={styles.bottom}>
                <div className={styles.bottom__container}>
                    <button
                        className={styles.bottom__button}
                        onClick={handleClickFilters}
                    >
                        <FontAwesomeIcon
                            icon={faFilter}
                            className={styles.bottom__icon}
                        />
                        <span className={styles.bottom__span}>Filtros</span>
                    </button>
                    <button
                        className={styles.bottom__button}
                        onClick={handleClickSocial}
                    >
                        <FontAwesomeIcon
                            icon={faUsers}
                            className={styles.bottom__icon}
                        />
                        <span className={styles.bottom__span}>Social</span>
                    </button>
                </div>
                <HomeFilter
                    isVisible={isFiltersVisible}
                    handleClose={() => {
                        setIsFiltersVisible(!isFiltersVisible)
                    }}
                />
                <HomeSocial
                    isVisible={isSocialVisible}
                    handleClose={() => {
                        setIsSocialVisible(!isSocialVisible)
                    }}
                    friends={[
                        {
                            image: '',
                            name: 'Lautaro Desoches',
                            user: 'lauti',
                        },
                        {
                            image: '',
                            name: 'Agustin Cardeli',
                            user: 'agus',
                        },
                    ]}
                    groups={[
                        {
                            name: 'Trabajo',
                            numberOfMembers: 7,
                        },
                        {
                            name: 'Amigos',
                            numberOfMembers: 5,
                        },
                    ]}
                />
            </section>
        </main>
    )
}
