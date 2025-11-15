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

   
    useEffect(() => {
       
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
            
           
            setData({
                [stepKey]: preSelected,
            })
            hasInitialized.current = true
        }
      
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

     
        if (step === 3 && newSelection.length >= 3) {
            setError(null)
        }
    }

    const handleNext = async () => {
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

            // Para paso 3 (gustos): validar mínimo de 3, pero SIEMPRE guardar
            if (step === 3) {
                if (current.length < 3) {
                    // Guardar igual para sincronizar con backend (aunque tenga 0 gustos)
                    console.log(`[Step ${step}] Guardando con menos de 3 gustos (sincronización):`, { ids, skip, endpoint })
                    
                    const saveResponse = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            ids,
                            skip,
                        }),
                    })

                    if (!saveResponse.ok) {
                        const errorData = await saveResponse.json().catch(() => ({}))
                        console.error(`[Step ${step}] Error guardando:`, errorData)
                    } else {
                        // Guardado exitoso, resetear flag para recargar desde backend
                        hasInitialized.current = false
                    }

                    // Mostrar error y NO avanzar
                    setError('Debes seleccionar al menos 3 gustos para continuar.')
                    return
                }
            }

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