'use client'
import styles from './styles.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faChevronDown, faChevronUp, faUser } from '@fortawesome/free-solid-svg-icons'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useUpdateUrlParam } from '@/hooks/useUpdateUrlParam'
import Image from 'next/image'
import { Friend } from '@/types'
import { getFriends } from '@/app/actions/friends'
import { searchRestaurantsByText } from '@/app/actions/restaurants'
import { ROUTES } from '@/routes'

interface SearchBarProps {
    showSearchField?: boolean
    showSelectors?: boolean
}

interface RestaurantSearchResult {
    id: string
    nombre: string
    categoria?: string
    rating?: number
    direccion: string
    imagenUrl?: string
    latitud?: number
    longitud?: number
}

export default function SearchBar({ showSearchField = true, showSelectors = true }: SearchBarProps) {
    const searchParams = useSearchParams()
    const updateUrlParam = useUpdateUrlParam()
    const router = useRouter()

    const [kmOpen, setKmOpen] = useState(false)
    const kmRef = useRef<HTMLDivElement>(null)
    const [selectedKm, setSelectedKm] = useState('3k')
    const [friendsOpen, setFriendsOpen] = useState(false)
    const [friends, setFriends] = useState<Friend[]>([])
    const [loadingFriends, setLoadingFriends] = useState(true)
    const [selectedFriend, setSelectedFriend] = useState<string>('Tus Gustos')
    const [selectedFriendUsername, setSelectedFriendUsername] = useState<string | null>(null)
    const friendsRef = useRef<HTMLDivElement>(null)

    // Estados para búsqueda de restaurantes
    const [searchText, setSearchText] = useState('')
    const [searchResults, setSearchResults] = useState<RestaurantSearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)

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
        const amigoFromUrl = searchParams.get('amigo')
        if (amigoFromUrl && friends.length > 0) {
            const friend = friends.find(f => f.username === amigoFromUrl)
            if (friend) {
                setSelectedFriend(friend.nombre)
                setSelectedFriendUsername(friend.username)
            }
        } else if (!amigoFromUrl) {
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
            try {
                const res = await getFriends()
                if (res.success && res.data) {
                    setFriends(res.data)
                }
            } catch (error) {
                console.error('Error loading friends:', error)
            } finally {
                setLoadingFriends(false)
            }
        }
        loadFriends()
    }, [])

    // --- SELECCIONAR AMIGO ---
    const handleFriendSelect = (friendUsername: string | null) => {
        if (!friendUsername) {
            setSelectedFriend('Tus Gustos')
            setSelectedFriendUsername(null)
            updateUrlParam('amigo', null)
        } else {
            const friend = friends.find(f => f.username === friendUsername)
            if (friend) {
                setSelectedFriend(friend.nombre)
                setSelectedFriendUsername(friend.username)
                updateUrlParam('amigo', friendUsername)
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

    // --- BÚSQUEDA DE RESTAURANTES ---
    useEffect(() => {
        const searchRestaurants = async () => {
            if (!searchText || searchText.trim().length < 2) {
                setSearchResults([])
                if (searchText.trim().length > 0) {
                    setShowResults(true)
                } else {
                    setShowResults(false)
                }
                return
            }

            setIsSearching(true)
            setShowResults(true) // Show results container to display "Buscando..."
            try {
                const result = await searchRestaurantsByText(searchText.trim())

                if (result.success && result.data) {
                    setSearchResults(result.data)
                    setShowResults(true)
                } else {
                    setSearchResults([])
                    setShowResults(false)
                }
            } catch (error) {
                console.error('Error al buscar restaurantes:', error)
                setSearchResults([])
                setShowResults(false)
            } finally {
                setIsSearching(false)
            }
        }

        const debounceTimer = setTimeout(() => {
            searchRestaurants()
        }, 300) // Debounce de 300ms

        return () => clearTimeout(debounceTimer)
    }, [searchText])

    const handleRestaurantSelect = (restaurant: RestaurantSearchResult) => {
        setSearchText('')
        setShowResults(false)

        // Si tiene coordenadas, mover el mapa a esa ubicación
        if (restaurant.latitud !== undefined && restaurant.longitud !== undefined) {
            // Disparar evento personalizado para que MapClient lo escuche
            window.dispatchEvent(new CustomEvent('mapPanTo', {
                detail: {
                    lat: restaurant.latitud,
                    lng: restaurant.longitud,
                    restaurantId: restaurant.id
                }
            }))
        } else {
            // Si no tiene coordenadas, ir directo a detalles
            router.push(`${ROUTES.RESTAURANT}${restaurant.id}`)
        }
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
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className={styles.buscador}>
            {/* Campo de búsqueda */}
            {showSearchField && (
                <div className={styles.buscador__campo} ref={searchRef}>
                    <FontAwesomeIcon icon={faSearch} className={styles.buscador__icono} />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Buscar restaurante..."
                        name="search"
                        className={styles.buscador__input}
                        value={searchText}
                        onChange={(e) => {
                            const val = e.target.value
                            setSearchText(val)
                            if (val.trim().length > 0) {
                                setShowResults(true)
                            } else {
                                setShowResults(false)
                            }
                        }}
                        onFocus={() => {
                            if (searchText.length > 0) {
                                setShowResults(true)
                            }
                        }}
                    />
                    {showResults && (searchResults.length > 0 || isSearching || (searchText.length > 0 && searchText.length < 2) || (searchText.length >= 2 && !isSearching && searchResults.length === 0)) && (
                        <div className={styles.buscador__results}>
                            {searchText.length > 0 && searchText.length < 2 ? (
                                <div className={styles.buscador__loading}>
                                    Ingresa al menos 2 letras
                                </div>
                            ) : isSearching ? (
                                <div className={styles.buscador__loading}>
                                    Buscando...
                                </div>
                            ) : searchResults.length === 0 ? (
                                <div className={styles.buscador__loading}>
                                    No se encontraron restaurantes
                                </div>
                            ) : (
                                searchResults.map((restaurant) => (
                                    <button
                                        key={restaurant.id}
                                        className={styles.buscador__resultItem}
                                        onClick={() => handleRestaurantSelect(restaurant)}
                                    >
                                        {restaurant.imagenUrl && (
                                            <Image
                                                src={restaurant.imagenUrl}
                                                alt={restaurant.nombre}
                                                width={40}
                                                height={40}
                                                className={styles.buscador__resultImage}
                                            />
                                        )}
                                        <div className={styles.buscador__resultInfo}>
                                            <span className={styles.buscador__resultName}>{restaurant.nombre}</span>
                                            {restaurant.direccion && (
                                                <span className={styles.buscador__resultAddress}>{restaurant.direccion}</span>
                                            )}
                                        </div>
                                        {restaurant.rating !== undefined && restaurant.rating !== null && typeof restaurant.rating === 'number' && (
                                            <span className={styles.buscador__resultRating}>
                                                ⭐ {restaurant.rating.toFixed(1)}
                                            </span>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Select de Kilómetros */}
            {showSelectors && (
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
            )}

            {/* SELECT DE AMIGOS */}
            {showSelectors && (
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
                            ) : selectedFriendUsername ? (
                                (() => {
                                    const friend = friends.find(f => f.username === selectedFriendUsername)
                                    return friend ? (
                                        <div className={styles.select__friend_avatar}>
                                            {friend.fotoPerfilUrl ? (
                                                <Image
                                                    src={friend.fotoPerfilUrl}
                                                    alt={friend.nombre}
                                                    width={28}
                                                    height={28}
                                                    className={styles.select__friend_icon}
                                                />
                                            ) : (
                                                <FontAwesomeIcon icon={faUser} />
                                            )}
                                        </div>
                                    ) : (
                                        <div
                                            className={styles.select__friend_avatar}
                                            style={{ backgroundColor: getSelectedFriendColor() }}
                                        />
                                    )
                                })()
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
                                className={`${styles.select__option_friend} ${selectedFriend === 'Tus Gustos' ? styles.select__option_active : ''}`}
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
                            {loadingFriends ? (
                                <div className={styles.select__loading}>
                                    Cargando amigos...
                                </div>
                            ) : (
                                friends.map((amigo) => {
                                    return (
                                        <button
                                            key={amigo.id}
                                            className={`${styles.select__option_friend} ${selectedFriendUsername === amigo.username ? styles.select__option_active : ''}`}
                                            onClick={() => handleFriendSelect(amigo.username)}
                                        >
                                            <div className={styles.select__friend_avatar}>
                                                {amigo.fotoPerfilUrl ? (
                                                    <Image
                                                        src={amigo.fotoPerfilUrl}
                                                        alt={amigo.nombre}
                                                        width={28}
                                                        height={28}
                                                        className={styles.select__friend_icon}
                                                    />
                                                ) : (
                                                    <FontAwesomeIcon icon={faUser} />
                                                )}
                                            </div>
                                            <span>{amigo.nombre}</span>
                                        </button>
                                    )
                                })
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
