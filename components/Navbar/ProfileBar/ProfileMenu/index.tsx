'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faGear, faDoorOpen } from '@fortawesome/free-solid-svg-icons'
import styles from './ProfileMenu.module.css'

interface ProfileMenuProps {
    onViewProfile: () => void
    onConfiguration: () => void
    onSignOut: () => void
}

export default function ProfileMenu({ 
    onViewProfile, 
    onConfiguration, 
    onSignOut 
}: ProfileMenuProps) {
    return (
        <div className={styles.menu}>
            <button
                className={styles.item}
                onClick={onViewProfile}
            >
                <FontAwesomeIcon icon={faUser} />
                <span>Ver Perfil</span>
            </button>
            <button
                className={styles.item}
                onClick={onConfiguration}
            >
                <FontAwesomeIcon icon={faGear} />
                <span>Configuración</span>
            </button>
            <button
                className={styles.item}
                onClick={onSignOut}
            >
                <FontAwesomeIcon icon={faDoorOpen} />
                <span>Cerrar Sesión</span>
            </button>
        </div>
    )
}

