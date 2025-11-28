'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { updateUserProfile } from '@/app/actions/settings'
import styles from './styles.module.css'

export default function ProfileTab() {
    const { user: backendUser, loading: backendLoading } = useCurrentUser()
    const router = useRouter()
    const toast = useToast()

    const [nombre, setNombre] = useState('')
    const [apellido, setApellido] = useState('')
    const [email, setEmail] = useState('')
    const [esPrivado, setEsPrivado] = useState(false)
    const [fotoPerfil, setFotoPerfil] = useState<string | null>(null)
    const [newPhoto, setNewPhoto] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    // Loading states for individual fields
    const [loadingGlobal, setLoadingGlobal] = useState(false)
    const [loadingPrivacidad, setLoadingPrivacidad] = useState(false)

    // Cargar datos del usuario cuando estén disponibles
    useEffect(() => {
        if (backendUser) {
            setNombre(backendUser.nombre || '')
            setApellido(backendUser.apellido || '')
            setEmail(backendUser.email || '')
            setEsPrivado(backendUser.esPrivado || false)
            setFotoPerfil(backendUser.fotoPerfilUrl || null)
        }
    }, [backendUser])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setNewPhoto(file)
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const handleUpdate = async (type: 'global' | 'privacy', privacyValue?: boolean) => {
        if (type === 'global') setLoadingGlobal(true)
        if (type === 'privacy') setLoadingPrivacidad(true)

        try {
            const formData = new FormData()

            // Usar valores actuales del estado
            formData.append('Nombre', nombre)
            formData.append('Apellido', apellido)
            formData.append('Email', email)

            // Si es privacy, usar el valor pasado, sino el del estado
            const privacyToSend = type === 'privacy' && privacyValue !== undefined ? privacyValue : esPrivado
            formData.append('EsPrivado', privacyToSend.toString())

            // Si hay nueva foto y es global update, enviarla
            if (type === 'global' && newPhoto) {
                formData.append('FotoPerfil', newPhoto)
            }

            const result = await updateUserProfile(formData)

            if (result.success && result.data) {
                toast.success('Perfil actualizado correctamente')

                if (type === 'global') {
                    // Actualizar foto si cambió
                    if (newPhoto) {
                        setNewPhoto(null)
                        // Keep previewUrl to show the uploaded image immediately without waiting for server propagation

                        // Handle potential casing issues from backend
                        const userData = result.data as any
                        const newUrl = userData.fotoPerfilUrl || userData.FotoPerfilUrl || userData.profilePictureUrl

                        if (newUrl) {
                            setFotoPerfil(newUrl)
                            if (typeof window !== 'undefined') {
                                window.dispatchEvent(new CustomEvent('friends:refresh'))
                            }
                        }
                    }
                }
            } else {
                toast.error(result.error || 'Error al actualizar perfil')
                // Revertir cambio de privacidad si falló
                if (type === 'privacy' && privacyValue !== undefined) {
                    setEsPrivado(!privacyValue)
                }
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error al actualizar perfil')
            if (type === 'privacy' && privacyValue !== undefined) {
                setEsPrivado(!privacyValue)
            }
        } finally {
            if (type === 'global') setLoadingGlobal(false)
            if (type === 'privacy') setLoadingPrivacidad(false)
        }
    }

    if (backendLoading) {
        return <div className={styles.loading}>Cargando...</div>
    }

    return (
        <div className={styles.form}>
            {/* Profile Photo Section */}
            <div className={styles.photoSection}>
                <div className={styles.avatarContainer}>
                    {previewUrl || fotoPerfil ? (
                        <img
                            src={previewUrl || fotoPerfil || ''}
                            alt="Foto de perfil"
                            className={styles.avatar}
                        />
                    ) : (
                        <div className={styles.avatarPlaceholder}>
                            {nombre[0]}{apellido[0]}
                        </div>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className={styles.hiddenInput}
                    />
                </div>
                <div className={styles.photoActions}>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className={styles.uploadButton}
                    >
                        Cambiar Foto
                    </button>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="nombre" className={styles.label}>
                    Nombre
                </label>
                <div className={styles.inputGroup}>
                    <input
                        id="nombre"
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className={styles.input}
                        required
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="apellido" className={styles.label}>
                    Apellido
                </label>
                <div className={styles.inputGroup}>
                    <input
                        id="apellido"
                        type="text"
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        className={styles.input}
                        required
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                    Correo Electrónico
                </label>
                <div className={styles.inputGroup}>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                        required
                    />
                </div>
            </div>

            <div className={styles.actions}>
                <button
                    onClick={() => handleUpdate('global')}
                    className={styles.saveButtonGlobal}
                    disabled={loadingGlobal}
                >
                    {loadingGlobal ? 'Guardando cambios...' : 'Guardar cambios'}
                </button>
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
                            onChange={(e) => {
                                const newValue = e.target.checked
                                setEsPrivado(newValue)
                                handleUpdate('privacy', newValue)
                            }}
                            disabled={loadingPrivacidad}
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>
            </div>
        </div>
    )
}
