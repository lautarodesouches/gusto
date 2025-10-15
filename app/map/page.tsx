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
import { HomeFilter, HomeSocial, Loading, MapView } from '@/components'
import { Suspense, useState } from 'react'
import { MapProvider } from '@/components/Home/MapProvider'
import Image from 'next/image'

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
        <Suspense fallback={<Loading message="Cargando mapa" />}>
            <main className={styles.main}>
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
                <section className={styles.middle}>
                    <div className={styles.middle__filter}>
                        <HomeFilter isVisible handleClose={() => {}} />
                    </div>
                    <div></div>
                    {/*<MapProvider><MapView /></MapProvider>*/}
                    <div className={styles.middle__filter}>
                        <HomeSocial
                            isVisible
                            handleClose={() => {
                                setIsSocialVisible(!isSocialVisible)
                            }}
                        />
                    </div>
                </section>
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
                    />
                </section>
            </main>
        </Suspense>
    )
}
