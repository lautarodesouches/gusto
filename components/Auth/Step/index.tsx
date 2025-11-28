'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './page.module.css'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { useStep } from '@/hooks/useStep'
import { useRegister } from '@/context/RegisterContext'
import { useRouter } from 'next/navigation'
import { RegisterItem } from '@/types'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
    saveRestricciones,
    updateRestricciones,
    saveCondiciones,
    updateCondiciones,
    saveGustos,
    updateGustos,
} from '@/app/actions/steps'

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

    const isLastStep = false
    const { data, setData, mode, basePath } = useRegister()
    const router = useRouter()
    const { token } = useAuth()
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const hasInitialized = useRef(false)
    const currentStepRef = useRef(step)

    const stepKey = `step${step}` as keyof typeof data
    const selected = data[stepKey] ?? []

    const handleStepChange = () => {
        if (currentStepRef.current !== step) {
            hasInitialized.current = false
            currentStepRef.current = step
        }
    }

    const shouldSyncData = (preSelected: RegisterItem[], currentData: RegisterItem[]): boolean => {
        return currentData.length === 0 ||
            preSelected.length !== currentData.length ||
            !preSelected.every(item => currentData.some(c => c.id === item.id))
    }

    const syncDataFromBackend = () => {
        if (content.length === 0 || hasInitialized.current) {
            return
        }

        const preSelected = content.filter(item => item.seleccionado)
        const currentData = data[stepKey] || []

        if (shouldSyncData(preSelected, currentData)) {
            setData({
                [stepKey]: preSelected,
            })
        }

        hasInitialized.current = true
    }

    useEffect(() => {
        handleStepChange()
        syncDataFromBackend()
        setSearchTerm('') // Limpiar búsqueda al cambiar de paso
    }, [content, step, stepKey, data, setData])

    const getSaveAction = () => {
        switch (step) {
            case 1:
                return mode === 'edicion' ? updateRestricciones : saveRestricciones
            case 2:
                return mode === 'edicion' ? updateCondiciones : saveCondiciones
            case 3:
                return mode === 'edicion' ? updateGustos : saveGustos
            default:
                return null
        }
    }

    const handleSelect = (id: number | string) => {
        setError(null) // Limpiar error cuando el usuario interactúa
        const current = selected as RegisterItem[]
        // Comparar IDs correctamente (pueden ser string o number)
        const alreadySelected = current.some(item => {
            // Comparación estricta considerando que pueden ser diferentes tipos
            return String(item.id) === String(id)
        })

        let newSelection: RegisterItem[]

        if (alreadySelected) {
            newSelection = current.filter(item => String(item.id) !== String(id))
        } else {
            // Para step 3 (gustos) no hay límite máximo, para otros steps máximo 5
            if (step !== 3 && current.length >= 5) {
                setError('Puedes seleccionar máximo 5 opciones')
                return
            }
            const newItem = content.find(item => String(item.id) === String(id))
            if (newItem) {
                newSelection = [...current, newItem]
            } else {
                return
            }
        }

        // Solo actualizar estado local (NO guardar en backend todavía)
        setData({
            [stepKey]: newSelection,
        })

        // Para step 3, limpiar error si tiene al menos 3
        if (step === 3 && newSelection.length >= 3) {
            setError(null)
        }
    }

    const handleNext = async () => {
        // Validar que basePath esté definido
        if (!basePath) {
            console.error('[Step] basePath no está definido')
            return
        }

        // NO saltar el guardado en el paso 3 - siempre debe guardar antes de avanzar
        if (!token) {
            // Si no hay token, solo navegar (no debería pasar en modo edición)
            if (step === 3) {
                router.push(`${basePath}/4`)
            } else {
                router.push(`${basePath}/${step + 1}`)
            }
            return
        }

        setSaving(true)
        setError(null)

        try {
            const current = selected as RegisterItem[]
            // Los IDs pueden ser números o strings (GUIDs), asegurarse de enviarlos correctamente
            const ids = current.map(item => {
                // Si el id es un número, convertirlo a string (aunque gustos deberían ser siempre strings/GUIDs)
                return typeof item.id === 'number' ? String(item.id) : item.id
            })

            // Para paso 3 (gustos): requiere mínimo 3 gustos, no se puede saltar
            if (step === 3) {
                if (current.length < 3) {
                    // NO permitir avanzar si tiene menos de 3 gustos
                    setError('Debes seleccionar al menos 3 gustos para continuar.')
                    setSaving(false)
                    return
                }
            }

            // Para step 3 no se puede saltar, para otros steps sí
            const skip = step === 3 ? false : current.length === 0

            const saveAction = getSaveAction()
            if (!saveAction) {
                setError('Error: acción no definida para este paso')
                setSaving(false)
                return
            }

            const result = await saveAction(ids, skip)

            if (!result.success) {
                console.error(`[Step ${step}] Error guardando en backend:`, result.error)
                const errorMessage = result.error || 'Error al guardar. Por favor intenta de nuevo.'
                setError(errorMessage)
                setSaving(false)
                return
            }

            // Éxito

            // En modo edición, después de guardar exitosamente, NO resetear hasInitialized
            // para que los datos del contexto se mantengan y no se sobrescriban al volver
            // Solo resetear si es modo registro
            if (mode !== 'edicion') {
                hasInitialized.current = false
            }

            // Si estamos en el paso 3, ir al paso 4 (resumen)
            if (step === 3) {
                router.push(`${basePath}/4`)
            } else {
                // Avanzar al siguiente paso
                router.push(`${basePath}/${step + 1}`)
            }
        } catch (error) {
            console.error('Error en handleNext:', error)
            setError('Error al guardar. Por favor intenta de nuevo.')
        } finally {
            setSaving(false)
        }
    }

    const handleBack = () => {
        if (!basePath) {
            console.error('[Step] basePath no está definido')
            return
        }
        router.push(`${basePath}/${step - 1}`)
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    const filteredContent = content.filter(item =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )

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
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                        <div className={styles.counter}>
                            <span>
                                {step === 3
                                    ? (selected as unknown as number[]).length
                                    : `${(selected as unknown as number[]).length}/5`}
                            </span>
                        </div>
                    </section>

                    <section className={styles.gridContainer}>
                        {filteredContent.map(({ id, nombre, imagenUrl }) => {
                            // Comparar IDs correctamente (pueden ser string o number)
                            const isSelected = selected.some(
                                item => String(item.id) === String(id)
                            )
                            // Para step 3, usar imagenUrl si está disponible
                            const hasImage = step === 3 && imagenUrl
                            return (
                                <button
                                    key={id}
                                    onClick={() => handleSelect(id)}
                                    className={`${styles.gridItem} ${isSelected ? styles.selected : ''
                                        } ${hasImage ? styles.withImage : ''}`}
                                >
                                    {hasImage && (
                                        <img
                                            src={imagenUrl}
                                            alt={nombre}
                                            className={styles.gridItemImage}
                                            loading="lazy"
                                        />
                                    )}
                                    <span className={styles.gridItemText}>
                                        {nombre}
                                    </span>
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
                            disabled={saving || (step === 3 && selected.length < 3)}
                        >
                            {saving
                                ? 'GUARDANDO..'
                                : isLastStep
                                    ? 'FINALIZAR'
                                    : step === 3 && selected.length < 3
                                        ? 'SELECCIONA MÍNIMO 3'
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