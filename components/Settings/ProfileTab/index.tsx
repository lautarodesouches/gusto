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
    const [loadingNombre, setLoadingNombre] = useState(false)
    const [loadingApellido, setLoadingApellido] = useState(false)
    const [loadingEmail, setLoadingEmail] = useState(false)
    const [loadingPrivacidad, setLoadingPrivacidad] = useState(false)
    const [loadingFoto, setLoadingFoto] = useState(false)

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

    const handleUpdate = async (field: 'nombre' | 'apellido' | 'email' | 'esPrivado' | 'foto', value: string | boolean | File) => {
        // Set loading state based on field
        if (field === 'nombre') setLoadingNombre(true)
        if (field === 'apellido') setLoadingApellido(true)
        if (field === 'email') setLoadingEmail(true)
        if (field === 'esPrivado') setLoadingPrivacidad(true)
        if (field === 'foto') setLoadingFoto(true)

        try {
            const formData = new FormData()
            // Use current state for other fields, but the new value for the updated field
            formData.append('Nombre', field === 'nombre' ? value as string : nombre)
            formData.append('Apellido', field === 'apellido' ? value as string : apellido)
            formData.append('Email', field === 'email' ? value as string : email)
            formData.append('EsPrivado', (field === 'esPrivado' ? value : esPrivado).toString())
            
            if (field === 'foto' && value instanceof File) {
                formData.append('FotoPerfil', value)
            }

            const result = await updateUserProfile(formData)

            if (result.success) {
                toast.success('Perfil actualizado correctamente')
                if (field === 'foto') {
                    setNewPhoto(null)
                    setPreviewUrl(null)
                }
                router.refresh()
            } else {
                toast.error(result.error || 'Error al actualizar perfil')
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error al actualizar perfil')
        } finally {
            if (field === 'nombre') setLoadingNombre(false)
            if (field === 'apellido') setLoadingApellido(false)
            if (field === 'email') setLoadingEmail(false)
            if (field === 'esPrivado') setLoadingPrivacidad(false)
            if (field === 'foto') setLoadingFoto(false)
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
                    {newPhoto && (
                        <button 
                            onClick={() => handleUpdate('foto', newPhoto)}
                            className={styles.saveButton}
                            disabled={loadingFoto}
                        >
                            {loadingFoto ? 'Guardando...' : 'Guardar Foto'}
                        </button>
                    )}
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
                    <button 
                        onClick={() => handleUpdate('nombre', nombre)}
                        className={styles.saveButton}
                        disabled={loadingNombre || nombre === backendUser?.nombre}
                    >
                        {loadingNombre ? 'Guardando...' : 'Guardar'}
                    </button>
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
                    <button 
                        onClick={() => handleUpdate('apellido', apellido)}
                        className={styles.saveButton}
                        disabled={loadingApellido || apellido === backendUser?.apellido}
                    >
                        {loadingApellido ? 'Guardando...' : 'Guardar'}
                    </button>
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
                    <button 
                        onClick={() => handleUpdate('email', email)}
                        className={styles.saveButton}
                        disabled={loadingEmail || email === backendUser?.email}
                    >
                        {loadingEmail ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
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
                                handleUpdate('esPrivado', newValue)
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
