'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { updateUserProfile } from '@/app/configuracion/actions'
import styles from './styles.module.css'

export default function ProfileTab() {
    const { user: backendUser, loading: backendLoading } = useCurrentUser()
    const router = useRouter()
    const toast = useToast()
    
    const [nombre, setNombre] = useState('')
    const [apellido, setApellido] = useState('')
    const [email, setEmail] = useState('')
    const [esPrivado, setEsPrivado] = useState(false)
    const [loading, setLoading] = useState(false)

    // Cargar datos del usuario cuando estén disponibles
    useEffect(() => {
        if (backendUser) {
            setNombre(backendUser.nombre || '')
            setApellido(backendUser.apellido || '')
            setEmail(backendUser.email || '')
            setEsPrivado(backendUser.esPrivado || false)
        }
    }, [backendUser])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData()
            formData.append('Nombre', nombre)
            formData.append('Apellido', apellido)
            formData.append('Email', email)
            formData.append('EsPrivado', esPrivado.toString())

            const result = await updateUserProfile(formData)

            if (result.success) {
                toast.success('Perfil actualizado correctamente')
                router.refresh()
            } else {
                toast.error(result.error || 'Error al actualizar perfil')
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error al actualizar perfil')
        } finally {
            setLoading(false)
        }
    }

    if (backendLoading) {
        return <div className={styles.loading}>Cargando...</div>
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
                <label htmlFor="nombre" className={styles.label}>
                    Nombre
                </label>
                <input
                    id="nombre"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className={styles.input}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="apellido" className={styles.label}>
                    Apellido
                </label>
                <input
                    id="apellido"
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    className={styles.input}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                    Correo Electrónico
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    required
                />
            </div>

            <div className={styles.privacySection}>
                <h3 className={styles.privacyTitle}>Privacidad de la cuenta</h3>
                
                <div className={styles.privacyOption}>
                    <div>
                        <h4 className={styles.optionTitle}>Cuenta Privada</h4>
                        <ul className={styles.optionList}>
                            <li>Si tu cuenta es pública, cualquier persona dentro o fuera de Gusto podrá ver tu perfil (gustos, lugares visitados, etc)</li>
                            <li>Si tu cuenta es privada solo amigos que tengas agregados podrán ver tu perfil</li>
                        </ul>
                    </div>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            checked={esPrivado}
                            onChange={(e) => setEsPrivado(e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>
            </div>

            <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
            >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
        </form>
    )
}
