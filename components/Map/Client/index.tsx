'use client'

import { Filters, SocialData } from '@/types'
import styles from './styles.module.css'
import FiltersClient from '../FiltersClient'
import MapClient from '../MapClient'
import SocialClient from '../SocialClient'
import SearchBar from '../SearchBar'
import ProfileBar from '../ProfileBar'
import FiltersSelector from '../FiltersSelector'
import FriendSearch from '@/components/Social/FriendSearch'
import GroupCreate from '@/components/Social/GroupCreate'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilter, faUsers, faX } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'

// ⬇️ Tus imports
import Nav from '../Nav'
import { useRegistrationCheck } from '@/hooks/useRegistrationCheck'
import { IncompleteRegistrationModal } from '@/components/modal/IncompleteRegistrationModal'

interface Props {
    socialData: SocialData
    filters: Filters
}

type ActivePanel = 'filters' | 'social' | null
type SocialPanel = 'searchFriend' | 'newGroup' | null

export default function Client({ socialData, filters }: Props) {

    // ⬇️ Tu lógica de registro incompleto
    const { checking, incompleto, paso } = useRegistrationCheck()

    const [activePanel, setActivePanel] = useState<ActivePanel>(null)
    const [isSocialExpanded, setIsSocialExpanded] = useState(true)
    const [showFiltersPanel, setShowFiltersPanel] = useState(false)
    const [activeSocialPanel, setActiveSocialPanel] = useState<SocialPanel>(null)

    const togglePanel = (panel: ActivePanel) => {
        setActivePanel(prev => (prev === panel ? null : panel))
    }

    const toggleSocialPanel = (panel: SocialPanel) => {
        setActiveSocialPanel(prev => (prev === panel ? null : panel))
    }

    // Mientras chequea…
    if (checking) {
        return <div style={{ color: 'white', padding: 20 }}>Cargando...</div>
    }

    return (
        <main className={styles.main}>

            {/* Modal de registro incompleto */}
            {incompleto && <IncompleteRegistrationModal paso={paso} />}

            {/* Si el registro NO está completo → solo modal */}
            {!incompleto && (
                <>
                    <Nav />

                    {/* ========== MOBILE MAP AREA (NUEVO DISEÑO) ========== */}
                    <div className={styles.mobile__map_container}>
                        <div className={styles.mobile__filters}>
                            <FiltersSelector />
                        </div>

                        <div className={styles.mobile__profile}>
                            <ProfileBar />
                        </div>

                        <MapClient containerStyle={styles.map_mobile} />
                    </div>

                    {/* ========== MOBILE BOTTOM NAV (NUEVO DISEÑO) ========== */}
                    <section className={styles.bottom}>
                        <div className={styles.bottom__wrapper}>
                            <div className={styles.bottom__search}>
                                <SearchBar />
                            </div>

                            <div className={styles.bottom__buttons}>
                                <button
                                    className={styles.bottom__button}
                                    onClick={() => togglePanel('filters')}
                                >
                                    <FontAwesomeIcon icon={faFilter} className={styles.bottom__icon} />
                                    <span className={styles.bottom__span}>Filtros</span>
                                </button>

                                <button
                                    className={styles.bottom__button}
                                    onClick={() => togglePanel('social')}
                                >
                                    <FontAwesomeIcon icon={faUsers} className={styles.bottom__icon} />
                                    <span className={styles.bottom__span}>Social</span>
                                </button>
                            </div>
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

                    {/* ========== DESKTOP LAYOUT ========== */}
                    <section className={styles.desktop}>

                        {/* Left social sidebar */}
                        <aside
                            className={`${styles.desktop__social} ${
                                isSocialExpanded ? styles.desktop__social_expanded : ''
                            }`}
                        >
                            <SocialClient
                                socialData={socialData}
                                isVisible={true}
                                isExpanded={isSocialExpanded}
                                onToggleExpand={() => setIsSocialExpanded(!isSocialExpanded)}
                                activePanel={activeSocialPanel}
                                onTogglePanel={toggleSocialPanel}
                            />
                        </aside>

                        {/* MAPA + FLOATING UI */}
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
                                    onClick={e => {
                                        e.stopPropagation()
                                        setShowFiltersPanel(!showFiltersPanel)
                                    }}
                                >
                                    <FontAwesomeIcon icon={showFiltersPanel ? faX : faFilter} />
                                </button>
                            </div>

                            {showFiltersPanel && (
                                <div className={styles.desktop__filters_panel}>
                                    <FiltersClient
                                        filters={filters}
                                        isVisible={showFiltersPanel}
                                        onClose={() => setShowFiltersPanel(false)}
                                    />
                                </div>
                            )}

                            {activeSocialPanel === 'searchFriend' && (
                                <div className={styles.desktop__social_panel}>
                                    <FriendSearch onClose={() => toggleSocialPanel(null)} />
                                </div>
                            )}

                            {activeSocialPanel === 'newGroup' && (
                                <div className={styles.desktop__social_panel}>
                                    <GroupCreate handleCancel={() => toggleSocialPanel(null)} />
                                </div>
                            )}
                        </div>
                    </section>
                </>
            )}
        </main>
    )
}