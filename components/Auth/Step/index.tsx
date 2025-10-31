'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './page.module.css'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { useStep } from '@/hooks/useStep'
import { useRegister } from '@/context/RegisterContext'
import { useRouter } from 'next/navigation'
import { RegisterItem } from '@/types'
import { useState } from 'react'

interface Props {
    title: string
    description: string
    inputDescription: string
    content: RegisterItem[]
}

export default function Step({
    title,
    description,
    inputDescription,
    content = [],
}: Props) {
    const step = useStep()
    const isLastStep = step === 3
    const { data, setData } = useRegister()
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)

    const stepKey = `step${step}` as keyof typeof data
    const selected = data[stepKey] ?? []

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

    const handleNext = async () => {
        router.push(`/auth/register/step/${step + 1}`)
        try {
            await fetch('/api/steps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    step1: data.step1 ?? [],
                    step2: data.step2 ?? [],
                    step3: data.step3 ?? [],
                }),
            })

            router.push(`/auth/register/step/${step + 1}`)
        } catch (err) {
            console.error('Error enviando pasos:', err)
        }
    }

    const handleBack = () => {
        router.push(`/auth/register/step/${step - 1}`)
    }

    return (
        <>
            {content.length !== 0 ? (
                <div className={styles.container}>
                    <header className={styles.header}>
                        <p className={styles.stepLabel}>Paso {step}</p>
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
                            <span>
                                {(selected as unknown as number[]).length}/5
                            </span>
                        </div>
                    </section>

                    <section className={styles.gridContainer}>
                        {content.map(({ id, nombre }) => {
                            const isSelected = selected.some(
                                item => item.id === id
                            )
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
                        {step !== 1 ? (
                            <button
                                onClick={handleBack}
                                className={styles.backButton}
                            >
                                VOLVER
                            </button>
                        ) : (
                            <div></div>
                        )}
                        <button
                            onClick={handleNext}
                            className={styles.skipButton}
                        >
                            {isLastStep
                                ? 'FINALIZAR'
                                : selected.length === 0
                                ? 'SALTAR'
                                : 'SIGUIENTE'}
                        </button>
                    </nav>
                </div>
            ) : (
                <div
                    style={{
                        color: 'var(--white)',
                        textAlign: 'center',
                        padding: '2rem',
                    }}
                >
                    No se pudieron cargar las opciones. Intenta recargar la
                    página.
                </div>
            )}
        </>
    )
}
