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
    // El paso 3 muestra "SIGUIENTE", el paso 4 tiene su propio botón "FINALIZAR"
    const isLastStep = false
    const { data, setData } = useRegister()
    const router = useRouter()
    const { token } = useAuth()
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const hasInitialized = useRef(false)
    const currentStepRef = useRef(step)

    const stepKey = `step${step}` as keyof typeof data
    const selected = data[stepKey] ?? []

    // Sincronizar con los items que ya están seleccionados desde el backend
    // Solo cuando se carga el paso por primera vez o cuando cambia el paso
    useEffect(() => {
        // Si cambió el paso, resetear el flag de inicialización
        if (currentStepRef.current !== step) {
            hasInitialized.current = false
            currentStepRef.current = step
        }

        if (content.length > 0 && !hasInitialized.current) {
            const preSelected = content.filter(item => item.seleccionado)
            console.log(`[Step ${step}] Sincronizando desde backend:`, {
                totalItems: content.length,
                seleccionados: preSelected.length,
                ids: preSelected.map(i => i.id)
            })
            
            // Sincronizar con el backend solo en la primera carga del paso
            // Esto asegura que si el usuario vuelve atrás, vea lo que realmente está guardado
            setData({
                [stepKey]: preSelected,
            })
            hasInitialized.current = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content, step])

    const getEndpoint = () => {
        switch (step) {
            case 1:
                return '/api/usuario/restricciones'
            case 2:
                return '/api/usuario/condiciones'
            case 3:
                return '/api/usuario/gustos'
            default:
                return null
        }
    }

    const handleSelect = (id: number) => {
        setError(null) // Limpiar error cuando el usuario interactúa
        const current = selected as RegisterItem[]
        const alreadySelected = current.some(item => item.id === id)

        let newSelection: RegisterItem[]

        if (alreadySelected) {
            newSelection = current.filter(item => item.id !== id)
        } else {
            if (current.length >= 5) {
                setError('Puedes seleccionar máximo 5 opciones')
                return
            }
            const newItem = content.find(item => item.id === id)
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

        // Si estamos en el paso 3 (gustos) y ahora tenemos 3 o más, limpiar el error
        if (step === 3 && newSelection.length >= 3) {
            setError(null)
        }
    }

    const handleNext = async () => {
        // Validación especial para paso 3 (gustos): mínimo 3 gustos
        if (step === 3) {
            const current = selected as RegisterItem[]
            if (current.length < 3) {
                setError('Debes seleccionar al menos 3 gustos para continuar.')
                return
            }
        }

        // Guardar en el backend antes de avanzar
        const endpoint = getEndpoint()
        if (!endpoint || !token) {
            router.push(`/auth/register/step/${step + 1}`)
            return
        }

        setSaving(true)
        setError(null)

        try {
            const current = selected as RegisterItem[]
            const ids = current.map(item => item.id)
            const skip = current.length === 0

            console.log(`[Step ${step}] Guardando:`, { ids, skip, endpoint })

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ids,
                    skip,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                console.error(`[Step ${step}] Error guardando en backend:`, errorData)
                
                // Extraer el mensaje de error del backend
                let errorMessage = 'Error al guardar. Por favor intenta de nuevo.'
                if (errorData.message) {
                    errorMessage = errorData.message
                } else if (errorData.error) {
                    errorMessage = errorData.error
                } else if (typeof errorData === 'string') {
                    errorMessage = errorData
                }
                
                setError(errorMessage)
                return // No avanzar si falla
            }

            const responseData = await response.json().catch(() => ({}))
            console.log(`[Step ${step}] Guardado exitoso:`, responseData)

            // Si todo está bien, resetear el flag de inicialización para que cuando vuelva atrás
            // se recargue desde el backend (esto fuerza la recarga de datos desde el servidor)
            hasInitialized.current = false
            
            // Avanzar al siguiente paso
            router.push(`/auth/register/step/${step + 1}`)
        } catch (error) {
            console.error('Error en handleNext:', error)
            setError('Error al guardar. Por favor intenta de nuevo.')
        } finally {
            setSaving(false)
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
                            disabled={saving}
                        >
                            {saving
                                ? 'GUARDANDO...'
                                : isLastStep
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