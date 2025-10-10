'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './page.module.css'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { useStep } from '@/hooks/useStep'
import { useRegister } from '@/context/RegisterContext'
import { useRouter } from 'next/navigation'
import { RegisterItem } from '@/types'

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

    const { data, setData } = useRegister()
    const router = useRouter()

    const stepKey = `step${step}` as keyof typeof data
    const selected = data[stepKey] ?? []

    const handleSelect = (id: number) => {
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

    const handleNext = () => {
        router.push(`/auth/register/step/${step + 1}`)
    }

    const handleBack = () => {
        if (step > 1) {
            router.push(`/auth/register/step/${step - 1}`)
        } else {
            router.push('/auth/register')
        }
    }

    return (
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

            <nav className={styles.actions}>
                <button onClick={handleBack} className={styles.backButton}>
                    VOLVER
                </button>
                <button onClick={handleNext} className={styles.skipButton}>
                    {selected.length === 0 ? 'SALTAR' : 'SIGUIENTE'}
                </button>
            </nav>
        </div>
    )
}
