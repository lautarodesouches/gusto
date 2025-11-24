'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { getProfile } from '@/app/perfil/actions'
import { User } from '@/types'
import { ProfileClient } from '@/components'
import styles from './styles.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { createPortal } from 'react-dom'

export default function ProfileOverlay() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const profileUsername = searchParams.get('profile')
    
    const [profile, setProfile] = useState<User | null>(null)
    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const fetchProfile = async () => {
            if (!profileUsername) {
                setProfile(null)
                return
            }

            setLoading(true)
            try {
                const res = await getProfile(profileUsername)
                if (res.success && res.data) {
                    setProfile(res.data)
                } else {
                    // Si falla, tal vez cerrar el overlay o mostrar error
                    console.error(res.error)
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [profileUsername])

    const handleClose = () => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete('profile')
        
        const newSearch = params.toString()
        const newPath = newSearch ? `${pathname}?${newSearch}` : pathname
        
        router.push(newPath as string, { scroll: false })
    }

    if (!mounted) return null

    const isOpen = !!profileUsername

    return createPortal(
        <>
            <div 
                className={`${styles.backdrop} ${isOpen ? styles.open : ''}`} 
                onClick={handleClose}
            />
            <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`}>
                {isOpen && (
                    <>
                        <button 
                            className={styles.closeButton} 
                            onClick={(e) => {
                                e.stopPropagation()
                                handleClose()
                            }}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                        
                        {loading ? (
                            <div className={styles.loading}>Cargando perfil...</div>
                        ) : profile ? (
                            <ProfileClient profile={profile} onGoBack={handleClose} />
                        ) : (
                            <div className={styles.loading}>No se encontró el usuario</div>
                        )}
                    </>
                )}
            </div>
        </>,
        document.body
    )
}
