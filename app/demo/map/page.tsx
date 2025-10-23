import { Suspense } from 'react'
import styles from './page.module.css'
import { Loading } from '@/components'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faSearch, faUser } from '@fortawesome/free-solid-svg-icons'
import { MapProvider } from '@/components/Map/MapProvider'
import Map from './map'
import Filter from './filter'
import Social from './social'

export default function Demo() {
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
                        <Filter />
                    </div>
                    <MapProvider>
                        <Map />
                    </MapProvider>
                    <div className={styles.middle__filter}>
                        <Social />
                    </div>
                </section>
            </main>
        </Suspense>
    )
}
