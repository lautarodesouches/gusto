'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './page.module.css'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { useRegister } from '@/context/RegisterContext'
import { RegisterItem } from '@/types'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
    title: string
    description: string
    inputDescription: string
    content: RegisterItem[]
    handleNext: () => void
    handlePrev?: () => void
    step: number
}

export default function Step({
    title,
    description,
    inputDescription,
    content = [],
    handleNext,
    handlePrev,
    step,
}: Props) {
    const router = useRouter()
    const isLastStep = step === 3
    const { data, setData } = useRegister()
    const [error, setError] = useState<string | null>(null)

    const stepKey = `step${step}` as keyof typeof data
    const selected = data[stepKey] ?? []

    const handleNextStep = () => {
        if (isLastStep) {
            // Obtener los nombres de los elementos seleccionados
            const selectedNames = (selected as RegisterItem[]).map(
                item => item.nombre
            )

            // Construir el query param "plato" separado por comas
            const query = selectedNames.length
                ? `?plato=${selectedNames.join(',')}`
                : ''

            // Redirigir a /demo/map con los gustos en la URL
            router.push(`/demo/map${query}`)
            return
        }

        handleNext()
    }

    const handleSelect = (id: number) => {
        setError(null)
        const current = selected as RegisterItem[]
        const alreadySelected = current.some(item => item.id === id)

        if (alreadySelected) {
            setData({
                [stepKey]: current.filter(item => item.id !== id),
            })
            return
        }

        if (current.length < 5) {
            const newItem = content.find(item => item.id === id)
            if (newItem) {
                setData({
                    [stepKey]: [...current, newItem],
                })
            }
        }
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.description}>{description}</p>
            </header>

            <section className={styles.searchContainer}>
                <div className={styles.searchBox}>
                    <FontAwesomeIcon
                        icon={faSearch}
                        className={styles.searchIcon}
                    />
                    <input
                        type="text"
                        placeholder={inputDescription}
                        className={styles.input}
                    />
                </div>
                <div className={styles.counter}>
                    <span>{(selected as unknown as number[]).length}/5</span>
                </div>
            </section>

            <section className={styles.gridContainer}>
                {content.map(({ id, nombre }) => {
                    const isSelected = selected.some(item => item.id === id)
                    return (
                        <button
                            key={id}
                            onClick={() => handleSelect(id)}
                            className={`${styles.gridItem} ${
                                isSelected ? styles.selected : ''
                            }`}
                        >
                            {nombre}
                        </button>
                    )
                })}
            </section>

            {error && <span className={styles.error}>{error}</span>}

            <nav className={styles.actions}>
                {handlePrev ? (
                    <button
                        onClick={() => handlePrev()}
                        className={styles.backButton}
                    >
                        VOLVER
                    </button>
                ) : (
                    <div></div>
                )}
                <button onClick={handleNextStep} className={styles.skipButton}>
                    {isLastStep
                        ? 'FINALIZAR'
                        : selected.length === 0
                        ? 'SALTAR'
                        : 'SIGUIENTE'}
                </button>
            </nav>
        </div>
    )
}
