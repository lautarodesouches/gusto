'use client'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/routes'
import styles from './styles.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faGear, faDoorOpen } from '@fortawesome/free-solid-svg-icons'
import NotificationBell from '@/components/NotificationBell/Notificacion'
import { FriendRequests, UpgradePremiumModal } from '@/components'
import { logout as logoutAction } from '@/app/actions/login'
import { useCurrentUser } from '@/hooks/useCurrentUser'

export default function ProfileBar() {
    const { user: backendUser, loading: backendLoading } = useCurrentUser()

    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [showPremiumModal, setShowPremiumModal] = useState(false)
    const [mounted, setMounted] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const { user, logout, isPremium } = useAuth()
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
    }, [])

    // Cerrar menús si se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setShowProfileMenu(false)
                setShowNotifications(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSignOut = async () => {
        // Eliminar cookie de autenticación
        await logoutAction()
        // Cerrar sesión en Firebase y limpiar estado
        await logout()
        // Redirigir a login
        router.push(ROUTES.LOGIN)
    }

    const handleViewProfile = () => {
        // Usar idUsuario (username) del backend, no email
        const username = backendUser?.idUsuario || user?.displayName || 'usuario'
        router.push(`${ROUTES.PROFILE}${username}`)
        setShowProfileMenu(false)
    }

    const handleConfiguration = () => {
       
        setShowProfileMenu(false)
    }
    if (backendLoading) {
        return (
            <div className={styles.barra_perfil}>
                <div className={styles.contenedor}>
                    <span className={styles.nombre}>...</span>
                </div>
            </div>
        )
    }
    
    return (
        <>
            <div className={styles.barra_perfil} ref={containerRef}>
                {/* Contenedor unificado: Premium + Notificaciones + Perfil */}
                <div className={styles.contenedor}>
                    {/* Botón Premium (solo si no es premium) */}
                    {!isPremium && (
                        <button
                            className={styles.boton_premium}
                            onClick={() => setShowPremiumModal(true)}
                            title="Hazte Premium"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/>
                                <path d="M5 21h14"/>
                            </svg>
                            <span className={styles.boton_premium__texto}>Premium</span>
                        </button>
                    )}

                    {/* Notificaciones */}
                    <div 
                        className={`${styles.notificacion} ${showNotifications ? styles.activo : ''}`}
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <NotificationBell 
                            showPanel={showNotifications}
                            isActive={showNotifications}
                        />
                    </div>


                    
                         <div className={styles.friendRequests}>
                        <FriendRequests />
                     </div>

                    {/* Perfil */}
                    <button
                        className={styles.boton_perfil}
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                        <div className={styles.avatar}>
                            <FontAwesomeIcon icon={faUser} />
                        </div>
                        <span className={styles.nombre}>
                            {backendUser?.idUsuario || user?.displayName || 'Usuario'}
                        </span>
                        {/* Corona Premium */}
                        {isPremium && (
                            <div className={styles.corona_premium}>
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="16" 
                                    height="16" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                >
                                    <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/>
                                    <path d="M5 21h14"/>
                                </svg>
                            </div>
                        )}
                    </button>

                    {/* Menú desplegable */}
                    {showProfileMenu && (
                        <div className={styles.menu}>
                            {/* Mostrar username del usuario */}
                            <div className={styles.menu__user_info}>
                                <FontAwesomeIcon icon={faUser} />
                                <span>{backendUser?.idUsuario || user?.displayName || 'Usuario'}</span>
                            </div>
                            <button
                                className={styles.menu__item}
                                onClick={handleViewProfile}
                            >
                                <FontAwesomeIcon icon={faUser} />
                                <span>Ver Perfil</span>
                            </button>
                            <button
                                className={styles.menu__item}
                                onClick={handleConfiguration}
                            >
                                <FontAwesomeIcon icon={faGear} />
                                <span>Configuración</span>
                            </button>
                            <button
                                className={styles.menu__item}
                                onClick={handleSignOut}
                            >
                                <FontAwesomeIcon icon={faDoorOpen} />
                                <span>Cerrar Sesión</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Premium - Renderizado con Portal fuera de la jerarquía */}
            {mounted && createPortal(
                <UpgradePremiumModal
                    isOpen={showPremiumModal}
                    onClose={() => setShowPremiumModal(false)}
                    trigger="general"
                />,
                document.body
            )}
        </>
    )
}
