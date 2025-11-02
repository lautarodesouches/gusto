'use client'
import { useEffect, useState } from 'react'
import FriendCard from '../FriendCard'
import { Friend } from '@/types'
import styles from './page.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { searchFriends } from '@/app/actions/friends'

export default function FriendSearch() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Array<Friend>>([])
    const [error, setError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value)
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            if (query.trim() === '') {
                setResults([])
                setError('')
                return
            }

            searchFriends(query).then(res => {
                if (res.success) {
                    setResults(res.data || [])
                    setError(
                        res.data?.length === 0
                            ? 'No encontramos resultados'
                            : ''
                    )
                } else {
                    setResults([])
                    setError(res.error || 'Error al buscar amigos')
                }
            })
        }, 500)

        return () => clearTimeout(handler)
    }, [query])

    return (
        <aside className={styles.search}>
            <header className={styles.search__header}>
                <FontAwesomeIcon
                    icon={faSearch}
                    className={styles.search__icon}
                />
                <input
                    type="text"
                    onChange={handleChange}
                    className={styles.search__input}
                    placeholder="Buscar por email"
                    value={query}
                />
            </header>
            {results && (
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
