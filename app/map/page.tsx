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
import { MapFilter, MapSocial, Loading, MapView, PremiumLimitFloatingCard } from '@/components'
import { Suspense, useState } from 'react'
import { MapProvider } from '@/components/Map/MapProvider'
import NotificationBell from '@/components/NotificationBell/Notificacion'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'

export default function Map() {
    const { isPremium } = useAuth()
    const [isFiltersVisible, setIsFiltersVisible] = useState(false)
    const [isSocialVisible, setIsSocialVisible] = useState(false)
    const [showPremiumModal, setShowPremiumModal] = useState(false)

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
                    {/* Botón Premium - Solo mostrar si NO es premium */}
                    {!isPremium && (
                        <button 
                            onClick={() => setShowPremiumModal(true)}
                            style={{
                                background: 'linear-gradient(135deg, #ff5050 0%, #ff6b6b 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '8px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(255, 80, 80, 0.3)',
                                transition: 'all 0.3s ease',
                                fontFamily: 'var(--font-plus)',
                                fontWeight: '600',
                                fontSize: '14px',
                                color: '#fff'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 80, 80, 0.4)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 80, 80, 0.3)'
                            }}
                        >
                            <span style={{ fontSize: '16px' }}>✨</span>
                            <span>Premium</span>
                        </button>
                    )}
        <div className={styles.nav__div}>
    <NotificationBell />
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
                    
                    <MapFilter isVisible handleClose={() => {}} />
                </div>
                <Suspense fallback={<Loading message="Cargando mapa" />}>
                    <MapProvider>
                        <MapView />
                    </MapProvider>
                </Suspense>
                <div className={styles.middle__filter}>
                    <MapSocial
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
                <MapFilter
                    isVisible={isFiltersVisible}
                    handleClose={() => {
                        setIsFiltersVisible(!isFiltersVisible)
                    }}
                />
                <MapSocial
                    isVisible={isSocialVisible}
                    handleClose={() => {
                        setIsSocialVisible(!isSocialVisible)
                    }}
                />
            </section>
            
            {/* Modal Premium */}
            <PremiumLimitFloatingCard
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
            />
        </main>
    )
}