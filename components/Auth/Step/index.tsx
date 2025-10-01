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

    return (
        <>
            <h3>Paso {step}</h3>
            <h2>{title}</h2>
            <p>{description}</p>
            <div>
                <div>
                    <FontAwesomeIcon icon={faSearch} />
                    <input
                        type="text"
                        placeholder={inputDescription}
                        className={styles.input}
                    />
                </div>
                <div>
                    <span>/5</span>
                </div>
            </div>
            <ul>
                {content.map(({ id, nombre }) => (
                    <li
                        key={id}
                        onClick={() => handleSelect(id)}
                        className="cursor-pointer hover:underline"
                    >
                        {nombre}
                    </li>
                ))}
            </ul>
            <button onClick={handleNext}>Siguiente</button>
        </>
    )
}
