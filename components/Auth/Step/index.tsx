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

    const { setData } = useRegister()
    const router = useRouter()

    const stepKey = `step${step}` as keyof typeof content
    const selected = content[stepKey] || []

    const handleSelect = (value: number) => {
        const current = selected as number[]

        // Si ya está seleccionado, lo quitamos
        if (current.includes(value)) {
            setData({ [stepKey]: current.filter(v => v !== value) })
            return
        }

        // Si hay menos de 5, lo agregamos
        if (current.length < 5) {
            setData({ [stepKey]: [...current, value] })
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
            <div className={styles.header}>
                <p className={styles.stepLabel}>Paso {step}</p>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.description}>{description}</p>
            </div>

            <div className={styles.searchContainer}>
                <div className={styles.searchBox}>
                    <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder={inputDescription}
                        className={styles.input}
                    />
                </div>
                <div className={styles.counter}>
                    <span>{(selected as number[]).length}/5</span>
                </div>
            </div>

            <div className={styles.gridContainer}>
                {content.map(({ id, nombre }) => {
                    const isSelected = (selected as number[]).includes(id)
                    return (
                        <button
                            key={id}
                            onClick={() => handleSelect(id)}
                            className={`${styles.gridItem} ${isSelected ? styles.selected : ''}`}
                        >
                            {nombre}
                        </button>
                    )
                })}
            </div>

            <div className={styles.actions}>
                <button onClick={handleBack} className={styles.backButton}>
                    VOLVER
                </button>
                <button onClick={handleNext} className={styles.skipButton}>
                    SALTAR
                </button>
            </div>
        </div>
    )
}
