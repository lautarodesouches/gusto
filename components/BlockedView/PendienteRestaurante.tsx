'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { logout as logoutAction } from '@/app/actions/login'
import styles from './page.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faEnvelope, faHome } from '@fortawesome/free-solid-svg-icons'
import { ROUTES } from '@/routes'
import { useState } from 'react'

export default function PendienteRestauranteBlocked() {
    const router = useRouter()
    const { logout } = useAuth()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleGoHome = async () => {
        try {
            setIsLoggingOut(true)
            // Eliminar cookie de autenticación (server action)
            await logoutAction()
            // Cerrar sesión en Firebase y limpiar estado
            await logout()
            // Redirigir al home
            router.push(ROUTES.HOME)
        } catch (error) {
            console.error('Error al cerrar sesión:', error)
            // Aún así redirigir al home
            router.push(ROUTES.HOME)
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <div className={styles.blockedContainer}>
            <div className={styles.blockedContent}>
                <div className={styles.blockedIcon}>
                    <FontAwesomeIcon icon={faClock} />
                </div>
                <h1 className={styles.blockedTitle}>
                    Solicitud en Revisión
                </h1>
                <p className={styles.blockedMessage}>
                    Tu solicitud de restaurante está siendo revisada por nuestros moderadores.
                </p>
                <p className={styles.blockedSubmessage}>
                    Te enviaremos un email comunicándote el resultado de la revisión.
                </p>
                <div className={styles.blockedEmailIcon}>
                    <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <button 
                    className={styles.blockedButton}
                    onClick={handleGoHome}
                    disabled={isLoggingOut}
                >
                    <FontAwesomeIcon icon={faHome} className={styles.blockedButtonIcon} />
                    {isLoggingOut ? 'Cerrando sesión...' : 'Volver al inicio'}
                </button>
            </div>
        </div>
    )
}

