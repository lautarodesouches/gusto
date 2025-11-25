'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { User } from '@/types'
import ProfileConfigView from './View'
import { updateProfile } from '@/app/actions/profile'

interface Props {
    profile: User
}

export default function ProfileConfigClient({ profile: initialProfile }: Props) {
    const router = useRouter()
    const { user } = useAuth()
    const toast = useToast()
    
    const [profile] = useState(initialProfile)
    const [username, setUsername] = useState(initialProfile.username || '')
    const [email, setEmail] = useState('')
    const [isPrivate, setIsPrivate] = useState(initialProfile.esPrivado || false)
    const [activeTab, setActiveTab] = useState<'perfil' | 'guardados'>('perfil')

    useEffect(() => {
        // Obtener email del usuario autenticado
        if (user?.email) {
            setEmail(user.email)
        }
    }, [user])

    const handleSave = async () => {
        try {
            const result = await updateProfile({
                username,
                esPrivado: isPrivate,
            })

            if (!result.success) {
                throw new Error(result.error || 'Error al actualizar perfil')
            }

            toast.success('Perfil actualizado exitosamente')
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error(error instanceof Error ? error.message : 'Error al actualizar el perfil')
        }
    }

    return (
        <ProfileConfigView
            profile={profile}
            username={username}
            email={email}
            isPrivate={isPrivate}
            activeTab={activeTab}
            onUsernameChange={setUsername}
            onIsPrivateChange={setIsPrivate}
            onActiveTabChange={setActiveTab}
            onSave={handleSave}
            onBack={() => router.back()}
        />
    )
}

