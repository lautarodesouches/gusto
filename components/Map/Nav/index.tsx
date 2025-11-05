'use client'
import Image from 'next/image'
import styles from './styles.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faUser, faCrown } from '@fortawesome/free-solid-svg-icons'
import NotificationBell from '@/components/NotificationBell/Notificacion'
import { FriendRequests } from '@/components'
import { PremiumLimitFloatingCard } from '@/components/Premium'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function Nav() {
    const [showPremiumCard, setShowPremiumCard] = useState(false)
    const { isPremium } = useAuth()

    return (
        <>
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
                    {!isPremium && (
                        <div
                            className={styles.nav__div}
                            onClick={() => setShowPremiumCard(true)}
                            style={{ cursor: 'pointer' }}
                            title="Actualizar a Premium"
                        >
                            <FontAwesomeIcon
                                icon={faCrown}
                                className={styles.nav__icon}
                                style={{ color: '#FFD700' }}
                            />
                        </div>
                    )}
                    <div className={styles.nav__div}>
                        <FriendRequests />
                    </div>
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

            <PremiumLimitFloatingCard
                isOpen={showPremiumCard}
                onClose={() => setShowPremiumCard(false)}
                limitInfo={{
                    tipoPlan: isPremium ? 'Premium' : 'Free',
                    limiteActual: 3,
                    gruposActuales: 0,
                }}
            />
        </>
    )
}
