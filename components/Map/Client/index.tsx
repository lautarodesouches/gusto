'use client'
import { Filters, SocialData } from '@/types'
import styles from './styles.module.css'
import FiltersClient from '../FiltersClient'
import MapClient from '../MapClient'
import SocialClient from '../SocialClient'
import SearchBar from '../SearchBar'
import ProfileBar from '../ProfileBar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilter, faUsers, faX } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'

interface Props {
    socialData: SocialData
    filters: Filters
}

type ActivePanel = 'filters' | 'social' | null

export default function Client({ socialData, filters }: Props) {
    const [activePanel, setActivePanel] = useState<ActivePanel>(null)
    const [isSocialExpanded, setIsSocialExpanded] = useState(true)
    const [showFiltersPanel, setShowFiltersPanel] = useState(false)

    const togglePanel = (panel: ActivePanel) => {
        setActivePanel(prev => (prev === panel ? null : panel))
    }

    return (
        <main className={styles.main}>
            {/* Mobile bottom nav */}
            <section className={styles.bottom}>
                <div className={styles.bottom__container}>
                    <button
                        className={styles.bottom__button}
                        onClick={() => togglePanel('filters')}
                    >
                        <FontAwesomeIcon
                            icon={faFilter}
                            className={styles.bottom__icon}
                        />
                        <span className={styles.bottom__span}>Filtros</span>
                    </button>
                    <button
                        className={styles.bottom__button}
                        onClick={() => togglePanel('social')}
                    >
                        <FontAwesomeIcon
                            icon={faUsers}
                            className={styles.bottom__icon}
                        />
                        <span className={styles.bottom__span}>Social</span>
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

            {/* Desktop layout */}
            <section className={styles.desktop}>
                {/* Social panel colapsable a la izquierda */}
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
                    />
                </aside>

                {/* Contenedor del mapa con componentes flotantes */}
                <div className={styles.desktop__map_container}>
                    {/* Buscador en la parte superior izquierda */}
                    <div className={styles.desktop__search}>
                        <SearchBar />
                    </div>

                    {/* Perfil y notificaciones en la parte superior derecha */}
                    <div className={styles.desktop__profile}>
                        <ProfileBar />
                    </div>

                    {/* Mapa */}
                    <MapClient containerStyle={styles.map} />

                    {/* Botón de filtros flotante en la parte inferior izquierda */}
                    <div className={styles.desktop__filters_buttons}>
                        <button
                            className={styles.desktop__filter_btn}
                            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                        >
                            <FontAwesomeIcon icon={showFiltersPanel ? faX : faFilter} />
                        </button>
                    </div>

                    {/* Panel de filtros desplegable */}
                    {showFiltersPanel && (
                        <div className={styles.desktop__filters_panel}>
                            <FiltersClient
                                filters={filters}
                                isVisible={showFiltersPanel}
                                onClose={() => setShowFiltersPanel(false)}
                            />
                        </div>
                    )}
                </div>
            </section>
        </main>
    )
}
