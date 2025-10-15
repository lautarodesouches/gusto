'use client'
import { useEffect, useState } from 'react'
import FriendCard from '../FriendCard'
import { Friend } from '@/types'
import styles from './page.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

export default function FriendSearch() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Array<Friend>>([])
    const [error, setError] = useState('')

    const search = async () => {
        try {
            const res = await fetch(
                `/api/social?endpoint=Amistad/buscar-usuarios/?q=${query}`
            )

            if (!res.ok) throw new Error('Error al buscar amigos')

            const data = await res.json()

            if (data.length === 0) setError('No encontramos resultados')

            setResults(data)
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            }
            console.error(err)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value)
    }

    useEffect(() => {
        if (query === '') setError('')
        search()
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
