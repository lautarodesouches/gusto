'use client'
import styles from './styles.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useUpdateUrlParam } from '@/hooks/useUpdateUrlParam'
import Image from 'next/image'
import { Friend } from '@/types'
import { getFriends } from '@/app/actions/friends'

export default function SearchBar() {
    const searchParams = useSearchParams()
    const updateUrlParam = useUpdateUrlParam()
    
    const [kmOpen, setKmOpen] = useState(false)
    const kmRef = useRef<HTMLDivElement>(null)
    const [selectedKm, setSelectedKm] = useState('3k')
    const [friendsOpen, setFriendsOpen] = useState(false)
    const [friends, setFriends] = useState<Friend[]>([])
    const [selectedFriend, setSelectedFriend] = useState<string>('Tus Gustos')
    const [selectedFriendUsername, setSelectedFriendUsername] = useState<string | null>(null)
    const friendsRef = useRef<HTMLDivElement>(null)

    const kmOptions = ['3k', '6k', '10k', 'Max']

    // Inicializar selectedKm desde la URL
    useEffect(() => {
        const kmFromUrl = searchParams.get('radius')
        if (kmFromUrl) {
            // Convertir de metros a formato km (ej: 3000 -> '3k')
            const meters = parseInt(kmFromUrl)
            if (meters === 3000) setSelectedKm('3k')
            else if (meters === 6000) setSelectedKm('6k')
            else if (meters === 10000) setSelectedKm('10k')
            else if (meters >= 50000 || kmFromUrl === 'Max') setSelectedKm('Max')
        }
    }, [searchParams])

    // Inicializar selectedFriend desde la URL
    useEffect(() => {
        const amigoUsernameFromUrl = searchParams.get('amigoUsername')
        if (amigoUsernameFromUrl && friends.length > 0) {
            const friend = friends.find(f => f.username === amigoUsernameFromUrl)
            if (friend) {
                setSelectedFriend(friend.nombre)
                setSelectedFriendUsername(friend.username)
            }
        } else if (!amigoUsernameFromUrl) {
            setSelectedFriend('Tus Gustos')
            setSelectedFriendUsername(null)
        }
    }, [searchParams, friends])

    const handleKmSelect = (option: string) => {
        setSelectedKm(option)
        setKmOpen(false)
        
        // Convertir opción a metros y guardar en URL
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
                radiusMeters = '50000' // o un valor muy grande
                break
        }
        
        updateUrlParam('radius', radiusMeters)
    }

useEffect(() => {
    async function loadFriends() {
        const res = await getFriends()
        if (res.success && res.data) {
            setFriends(res.data)
        }
    }
    loadFriends()
}, [])

// --- SELECCIONAR AMIGO ---
const handleFriendSelect = (friendUsername: string | null) => {
    if (!friendUsername) {
        setSelectedFriend('Tus Gustos')
        setSelectedFriendUsername(null)
        updateUrlParam('amigoUsername', null)
    } else {
        const friend = friends.find(f => f.username === friendUsername)
        if (friend) {
            setSelectedFriend(friend.nombre)
            setSelectedFriendUsername(friend.username)
            updateUrlParam('amigoUsername', friendUsername)
        }
    }
    setFriendsOpen(false)
}

// Función para obtener el color del amigo seleccionado
const getSelectedFriendColor = () => {
    if (!selectedFriendUsername) return '#ff5050'
    const index = friends.findIndex(f => f.username === selectedFriendUsername)
    if (index === -1) return '#ff5050'
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0']
    return colors[index % colors.length]
}

// --- CERRAR DROPDOWN ---
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
        <div className={styles.buscador}>
            {/* Campo de búsqueda */}
            <div className={styles.buscador__campo}>
                <FontAwesomeIcon icon={faSearch} className={styles.buscador__icono} />
                <input
                    type="text"
                    placeholder="Escribe un lugar"
                    name="search"
                    className={styles.buscador__input}
                />
            </div>

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

           {/* SELECT DE AMIGOS */}
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
            {/* TUS GUSTOS */}
            <button
                className={styles.select__option_friend}
                onClick={() => handleFriendSelect(null)}
            >
                <div className={styles.select__friend_avatar}>
                    <Image
                        src="/images/all/tus_gustos.svg"
                        alt="Tus Gustos"
                        width={28}
                        height={28}
                        className={styles.select__friend_icon}
                    />
                </div>
                <span>Tus Gustos</span>
            </button>

            {/* AMIGOS REALES */}
            {friends.map((amigo, index) => {
                // Colores para los avatares (similar al código anterior)
                const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0']
                const color = colors[index % colors.length]
                
                return (
                    <button
                        key={amigo.id}
                        className={styles.select__option_friend}
                        onClick={() => handleFriendSelect(amigo.username)}
                    >
                        <div 
                            className={styles.select__friend_avatar}
                            style={{ backgroundColor: color }}
                        />
                        <span>{amigo.nombre}</span>
                    </button>
                )
            })}
        </div>
    )}
</div>
        </div>
    )
}
