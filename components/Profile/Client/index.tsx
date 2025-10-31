'use client'
import { useState } from 'react'
import { User } from '@/types'
import { ProfileView } from '../View'

interface ProfileClientProps {
    profile: User
    isOwnProfile?: boolean
    isFriend?:boolean
}

export default function ProfileClient({
    profile,
    isOwnProfile = false,
    isFriend = false,
}: ProfileClientProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [currentProfile, setCurrentProfile] = useState(profile)

    const handleProfileUpdated = (updatedProfile: User) => {
        setCurrentProfile(updatedProfile)
        setIsEditing(false)
    }

    if (isEditing && isOwnProfile) {
        return (
            <></>
            /*<ProfileEdit
                profile={currentProfile}
                onCancel={() => setIsEditing(false)}
                onSuccess={handleProfileUpdated}
            />*/
        )
    }

    return (
        <ProfileView
            profile={currentProfile}
            isOwnProfile={isOwnProfile}
            isFriend={isFriend}
            onEdit={() => setIsEditing(true)}
        />
    )
}
