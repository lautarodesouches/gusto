'use client'
import styles from './styles.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useUpdateUrlParam } from '@/hooks/useUpdateUrlParam'
import Image from 'next/image'

export default function FiltersSelector() {
    const searchParams = useSearchParams()
    const updateUrlParam = useUpdateUrlParam()
    
    const [kmOpen, setKmOpen] = useState(false)
    const [friendsOpen, setFriendsOpen] = useState(false)
    const [selectedKm, setSelectedKm] = useState('3k')
    const [selectedFriend, setSelectedFriend] = useState('Tus Gustos')
    const kmRef = useRef<HTMLDivElement>(null)
    const friendsRef = useRef<HTMLDivElement>(null)

    const kmOptions = ['3k', '6k', '10k', 'Max']
    const friendsOptions = [
        { name: 'Tus Gustos', color: '#ff5050', isDefault: true },
        { name: 'Amigo 1', color: '#4CAF50', isDefault: false },
        { name: 'Amigo 2', color: '#2196F3', isDefault: false },
        { name: 'Amigo 3', color: '#FF9800', isDefault: false },
        { name: 'Amigo 4', color: '#9C27B0', isDefault: false }
    ]

    // Inicializar selectedKm desde la URL
    useEffect(() => {
        const kmFromUrl = searchParams.get('radius')
        if (kmFromUrl) {
            const meters = parseInt(kmFromUrl)
            if (meters === 3000) setSelectedKm('3k')
            else if (meters === 6000) setSelectedKm('6k')
            else if (meters === 10000) setSelectedKm('10k')
            else if (meters >= 50000 || kmFromUrl === 'Max') setSelectedKm('Max')
        }
    }, [searchParams])

    const handleKmSelect = (option: string) => {
        setSelectedKm(option)
        setKmOpen(false)
        
        let radiusMeters: string | null = null
        switch (option) {
            case '3k':
                radiusMeters = '3000'
                break
            case '6k':
                radiusMeters = '6000'
                break
            case '10k':
                radiusMeters = '10000'
                break
            case 'Max':
                radiusMeters = '50000'
                break
        }
        
        updateUrlParam('radius', radiusMeters)
    }

    const handleFriendSelect = (friendName: string) => {
        setSelectedFriend(friendName)
        setFriendsOpen(false)
    }

    const getSelectedFriendColor = () => {
        const friend = friendsOptions.find(f => f.name === selectedFriend)
        return friend?.color || '#ff5050'
    }

    // Cerrar dropdowns al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (kmRef.current && !kmRef.current.contains(event.target as Node)) {
                setKmOpen(false)
            }
            if (friendsRef.current && !friendsRef.current.contains(event.target as Node)) {
                setFriendsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className={styles.selector}>
            {/* Select de Kilómetros */}
            <div className={styles.select} ref={kmRef}>
                <button 
                    className={styles.select__button}
                    onClick={() => {
                        setKmOpen(!kmOpen)
                        setFriendsOpen(false)
                    }}
                >
                    <span className={styles.select__text}>{selectedKm}</span>
                    <FontAwesomeIcon 
                        icon={kmOpen ? faChevronUp : faChevronDown} 
                        className={styles.select__icon}
                    />
                </button>
                {kmOpen && (
                    <div className={styles.select__dropdown}>
                        {kmOptions.map((option) => (
                            <button
                                key={option}
                                className={`${styles.select__option} ${selectedKm === option ? styles.select__option_active : ''}`}
                                onClick={() => handleKmSelect(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Select de Amigos */}
            <div className={styles.select_friends} ref={friendsRef}>
                <button 
                    className={styles.select__button}
                    onClick={() => {
                        setFriendsOpen(!friendsOpen)
                        setKmOpen(false)
                    }}
                >
                    <div className={styles.select__friend_display}>
                        {selectedFriend === 'Tus Gustos' ? (
                            <div className={styles.select__friend_avatar}>
                                <Image
                                    src="/images/all/tus_gustos.svg"
                                    alt="Tus Gustos"
                                    width={28}
                                    height={28}
                                    className={styles.select__friend_icon}
                                />
                            </div>
                        ) : (
                            <div 
                                className={styles.select__friend_avatar}
                                style={{ backgroundColor: getSelectedFriendColor() }}
                            />
                        )}
                        <span className={styles.select__text}>{selectedFriend}</span>
                    </div>
                    <FontAwesomeIcon 
                        icon={friendsOpen ? faChevronUp : faChevronDown} 
                        className={styles.select__icon}
                    />
                </button>
                {friendsOpen && (
                    <div className={styles.select__dropdown}>
                        {friendsOptions.map((friend) => (
                            <button
                                key={friend.name}
                                className={`${styles.select__option_friend} ${selectedFriend === friend.name ? styles.select__option_active : ''}`}
                                onClick={() => handleFriendSelect(friend.name)}
                            >
                                {friend.isDefault ? (
                                    <div className={styles.select__friend_avatar}>
                                        <Image
                                            src="/images/all/tus_gustos.svg"
                                            alt="Tus Gustos"
                                            width={28}
                                            height={28}
                                            className={styles.select__friend_icon}
                                        />
                                    </div>
                                ) : (
                                    <div 
                                        className={styles.select__friend_avatar}
                                        style={{ backgroundColor: friend.color }}
                                    />
                                )}
                                <span>{friend.name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

