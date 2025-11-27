'use client'
import { useEffect, useState } from 'react'
import FriendCard from '../FriendCard'
import { Friend } from '@/types'
import styles from './page.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faX } from '@fortawesome/free-solid-svg-icons'
import { searchFriends } from '@/app/actions/friends'

interface FriendSearchProps {
    onClose?: () => void
}

export default function FriendSearch({ onClose }: FriendSearchProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Array<Friend>>([])
    const [error, setError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value)
    }



    const search = async () => {
        try {
            const result = await searchFriends(query)

            if (!result.success) throw new Error(result.error || 'Error al buscar amigos')

            if (!result.data || result.data.length === 0) setError('No encontramos resultados')

            setResults(result.data || [])
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            }
            console.error(err)
        }
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            if (query.trim() === '') {
                setResults([])
                setError('')
                return
            }

            search()
        }, 500)

        return () => clearTimeout(handler)
    }, [query])

    return (
        <aside className={styles.search}>
            {onClose && (
                <button
                    className={styles.search__close}
                    onClick={onClose}
                    aria-label="Cerrar"
                >
                    <FontAwesomeIcon icon={faX} />
                </button>
            )}
            <header className={styles.search__header}>
                <FontAwesomeIcon
                    icon={faSearch}
                    className={styles.search__icon}
                />
                <input
                    type="text"
                    onChange={handleChange}
                    className={styles.search__input}
                    placeholder="Usuario de tu amigo"
                    value={query}
                />
            </header>
            <p className={styles.search__description}>
                Busca usuarios por su nombre de usuario para agregarlos como amigos
            </p>
            {results.length > 0 && (
                <div className={styles.search__results}>
                    {results.map(f => (
                        <FriendCard friend={f} key={f.id} isSearching />
                    ))}
                </div>
            )}
            {error && results.length === 0 && (
                <span className={styles.search__error}>{error}</span>
            )}
        </aside>
    )
}
