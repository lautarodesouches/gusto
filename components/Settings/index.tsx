'use client'

import { useState } from 'react'
import ProfileTab from './ProfileTab'
import FavoritesTab from './FavoritesTab'
import styles from './styles.module.css'

type Tab = 'perfil' | 'favoritos'

export default function Settings() {
    const [activeTab, setActiveTab] = useState<Tab>('perfil')

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'perfil' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('perfil')}
                >
                    Perfil
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'favoritos' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('favoritos')}
                >
                    Favoritos
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'perfil' && <ProfileTab />}
                {activeTab === 'favoritos' && <FavoritesTab />}
            </div>
        </div>
    )
}
