'use client'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/routes'
import styles from './ProfileBar.module.css'
import { UpgradePremiumModal } from '@/components'
import { logout as logoutAction } from '@/app/actions/login'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import PremiumButton from './PremiumButton'
import NotificationButton from './NotificationButton'
import ProfileButton from './ProfileButton'
import ProfileMenu from './ProfileMenu'

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
            const target = event.target as Node

            // Verificar si el clic fue dentro del contenedor del ProfileBar
            const clickedInsideContainer = containerRef.current?.contains(target)

            // Verificar si el clic fue dentro del panel de notificaciones (renderizado con portal)
            const notificationPanel = document.querySelector('[data-notification-panel="true"]')
            const clickedInsidePanel = notificationPanel?.contains(target)

            // Si el clic fue fuera de ambos, cerrar los menús
            if (!clickedInsideContainer && !clickedInsidePanel) {
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
        // Usar idUsuario (username) del backend para la ruta
        const username = backendUser?.idUsuario || user?.displayName || 'usuario'
        // Redirigir al mapa con el parámetro profile para abrir el overlay
        router.push(`${ROUTES.MAP}?profile=${username}`)
        setShowProfileMenu(false)
    }

    const handleConfiguration = () => {
        router.push(ROUTES.SETTINGS)
        setShowProfileMenu(false)
    }

    const username = backendUser?.idUsuario || user?.displayName || 'Usuario'

    if (backendLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.wrapper}>
                    <span className={styles.loading}>...</span>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className={styles.container} ref={containerRef}>
                <div className={styles.wrapper}>
                    <div className={styles.glass_background} />
                    {/* Botón Premium (solo si no es premium) */}
                    {!isPremium && (
                        <PremiumButton
                            onClick={() => setShowPremiumModal(true)}
                        />
                    )}

                    {/* Notificaciones */}
                    <NotificationButton
                        isActive={showNotifications}
                        showPanel={showNotifications}
                        onClick={() => setShowNotifications(!showNotifications)}
                    />

                    {/* Perfil */}
                    <ProfileButton
                        username={username}
                        imageUrl={backendUser?.fotoPerfilUrl}
                        isPremium={isPremium}
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    />

                    {/* Menú desplegable */}
                    {showProfileMenu && (
                        <ProfileMenu
                            onViewProfile={handleViewProfile}
                            onConfiguration={handleConfiguration}
                            onSignOut={handleSignOut}
                        />
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

