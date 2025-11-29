'use client'

import { Filters, SocialData } from '@/types'
import styles from './styles.module.css'
import FiltersClient from '../FiltersClient'
import MapClient from '../MapClient'
import SocialClient from '../SocialClient'
import SearchBar from '../SearchBar'
import ProfileBar from '@/components/Navbar/ProfileBar'
import FriendSearch from '@/components/Social/FriendSearch'
import GroupCreate from '@/components/Social/GroupCreate'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilter, faUsers, faX } from '@fortawesome/free-solid-svg-icons'
import { useState, useEffect } from 'react'
import { useRegistrationCheck } from '@/hooks/useRegistrationCheck'
import { IncompleteRegistrationModal } from '@/components/modal/IncompleteRegistrationModal'
import { PaymentSuccess } from '@/components'
import { useSearchParams, useRouter } from 'next/navigation'

interface Props {
    socialData: SocialData
    filters: Filters
}

type ActivePanel = 'filters' | 'social' | null
type SocialPanel = 'searchFriend' | 'newGroup' | null

export default function Client({ socialData, filters }: Props) {
    const { checking, incompleto, paso, mostrarModal } = useRegistrationCheck()
    const [showModal, setShowModal] = useState(false)
    const searchParams = useSearchParams()
    const router = useRouter()
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)

    const [activePanel, setActivePanel] = useState<ActivePanel>(null)
    const [isSocialExpanded, setIsSocialExpanded] = useState(true)
    const [showFiltersPanel, setShowFiltersPanel] = useState(false)
    const [activeSocialPanel, setActiveSocialPanel] =
        useState<SocialPanel>(null)

    // Detectar si viene de un pago exitoso
    useEffect(() => {
        const payment = searchParams.get('payment')
        if (payment === 'success') {
            console.log('🎉 [MapClient] Pago exitoso detectado, mostrando animación')
            setShowPaymentSuccess(true)
            // Limpiar el parámetro de la URL
            router.replace('/mapa')
        }
    }, [searchParams, router])

    useEffect(() => {
        if (incompleto && mostrarModal && !checking) {
            setShowModal(true)
        } else {
            setShowModal(false)
        }
    }, [incompleto, mostrarModal, checking])

    const handleCloseModal = () => {
        setShowModal(false)
        sessionStorage.setItem('registrationModalDismissed', 'true')
    }

    const togglePanel = (panel: ActivePanel) => {
        setActivePanel(prev => (prev === panel ? null : panel))
    }

    const toggleSocialPanel = (panel: SocialPanel) => {
        setActiveSocialPanel(prev => (prev === panel ? null : panel))
    }

    return (
        <main className={styles.main}>
            {/* Modal de pago exitoso */}
            <PaymentSuccess 
                show={showPaymentSuccess} 
                onComplete={() => setShowPaymentSuccess(false)}
            />
            
            {showModal && incompleto && !checking && (
                <IncompleteRegistrationModal
                    paso={paso}
                    onClose={handleCloseModal}
                />
            )}

            <>
                {/* MOBILE */}
                <section className={styles.mobile__map_container}>
                    {/* Navbar mobile fijo en la parte superior - solo selectores y profile bar */}
                    <nav className={styles.mobile__navbar}>
                        <div className={styles.mobile__navbar_content}>
                            <div className={styles.mobile__navbar_selectors}>
                                <SearchBar showSearchField={false} />
                            </div>
                            <div className={styles.mobile__navbar_profile}>
                                <ProfileBar />
                            </div>
                        </div>
                    </nav>

                    <MapClient containerStyle={styles.map_mobile} />
                </section>

                {/* MOBILE BOTTOM NAV */}
                <section className={styles.bottom}>
                    {/* Buscador arriba de los botones */}
                    <div className={styles.bottom__search}>
                        <SearchBar showSearchField={true} showSelectors={false} placement="top" />
                    </div>

                    <div className={styles.bottom__container}>
                        <button
                            className={styles.bottom__button}
                            onClick={() => togglePanel('filters')}
                        >
                            <FontAwesomeIcon
                                icon={faFilter}
                                className={styles.bottom__icon}
                            />
                            <span className={styles.bottom__span}>
                                Filtros
                            </span>
                        </button>

                        <button
                            className={styles.bottom__button}
                            onClick={() => togglePanel('social')}
                        >
                            <FontAwesomeIcon
                                icon={faUsers}
                                className={styles.bottom__icon}
                            />
                            <span className={styles.bottom__span}>
                                Social
                            </span>
                        </button>
                    </div>

                    <FiltersClient
                        isVisible={activePanel === 'filters'}
                        onClose={() => togglePanel('filters')}
                        filters={filters}
                    />

                    <SocialClient
                        socialData={socialData}
                        isVisible={activePanel === 'social'}
                        onClose={() => togglePanel('social')}
                    />
                </section>

                {/* DESKTOP */}
                <section className={styles.desktop}>
                    {/* Panel social colapsable */}
                    <aside
                        className={`${styles.desktop__social} ${isSocialExpanded
                                ? styles.desktop__social_expanded
                                : ''
                            }`}
                    >
                        <SocialClient
                            socialData={socialData}
                            isVisible={true}
                            isExpanded={isSocialExpanded}
                            onToggleExpand={() =>
                                setIsSocialExpanded(!isSocialExpanded)
                            }
                            activePanel={activeSocialPanel}
                            onTogglePanel={toggleSocialPanel}
                        />
                    </aside>

                    {/* MAPA + FLOTANTES */}
                    <div className={styles.desktop__map_container}>
                        <div className={styles.desktop__search}>
                            <SearchBar />
                        </div>

                        <div className={styles.desktop__profile}>
                            <ProfileBar />
                        </div>

                        <MapClient containerStyle={styles.map} />

                        <div className={styles.desktop__filters_buttons}>
                            <button
                                className={styles.desktop__filter_btn}
                                onClick={() =>
                                    setShowFiltersPanel(!showFiltersPanel)
                                }
                            >
                                <FontAwesomeIcon
                                    icon={showFiltersPanel ? faX : faFilter}
                                />
                            </button>
                        </div>

                        {showFiltersPanel && (
                            <div className={styles.desktop__filters_panel}>
                                <FiltersClient
                                    filters={filters}
                                    isVisible={showFiltersPanel}
                                    onClose={() =>
                                        setShowFiltersPanel(false)
                                    }
                                />
                            </div>
                        )}

                        {activeSocialPanel === 'searchFriend' && (
                            <div className={styles.desktop__social_panel}>
                                <FriendSearch
                                    onClose={() => toggleSocialPanel(null)}
                                />
                            </div>
                        )}

                        {activeSocialPanel === 'newGroup' && (
                            <div className={styles.desktop__social_panel}>
                                <GroupCreate
                                    handleCancel={() =>
                                        toggleSocialPanel(null)
                                    }
                                />
                            </div>
                        )}
                    </div>
                </section>
            </>
        </main>
    )
}
