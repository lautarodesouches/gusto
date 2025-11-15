'use client'

import { Filters, SocialData } from '@/types'
import Nav from '../Nav'
import styles from './styles.module.css'
import FiltersClient from '../FiltersClient'
import MapClient from '../MapClient'
import SocialClient from '../SocialClient'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilter, faUsers } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import { useRegistrationCheck } from '@/hooks/useRegistrationCheck'
import { IncompleteRegistrationModal } from '@/components/modal/IncompleteRegistrationModal'


interface Props {
    socialData: SocialData
    filters: Filters
}

type ActivePanel = 'filters' | 'social' | null

export default function Client({ socialData, filters }: Props) {
    
    const { checking, incompleto, paso } = useRegistrationCheck()

    const [activePanel, setActivePanel] = useState<ActivePanel>(null)

    const togglePanel = (panel: ActivePanel) => {
        setActivePanel(prev => (prev === panel ? null : panel))
    }

    if (checking) {
        return <div style={{ color: 'white', padding: 20 }}>Cargando...</div>
    }

    return (
        <main className={styles.main}>
            
            {/* Modal si no completó el registro */}
            {incompleto && <IncompleteRegistrationModal paso={paso} />}

            {/* Si NO completó preferencias, NO mostramos el mapa */}
            {!incompleto && (
                <>
                    <Nav />
                    <section className={styles.middle}>
                        <div className={styles.middle__filter}>
                            <FiltersClient filters={filters} />
                        </div>
                        <div className={styles.middle__map}>
                            <MapClient containerStyle={styles.map} />
                        </div>
                        <div className={styles.middle__filter}>
                            <SocialClient socialData={socialData} />
                        </div>
                    </section>

                    <section className={styles.bottom}>
                        <div className={styles.bottom__container}>
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
                </>
            )}
        </main>
    )
}
