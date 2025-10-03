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
import { HomeFilter, HomeSocial } from '@/components'
import { useState } from 'react'

export default function Map() {
    const [isFiltersVisible, setIsFiltersVisible] = useState(false)
    const [isSocialVisible, setIsSocialVisible] = useState(false)

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
                <div className={styles.nav__div}>
                    <FontAwesomeIcon
                        icon={faUser}
                        className={styles.nav__icon}
                    />
                </div>
            </nav>
            <div className={styles.map}></div>
            <section className={styles.bottom}>
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
