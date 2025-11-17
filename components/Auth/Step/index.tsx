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
    const { data, setData, mode, basePath } = useRegister()
    const router = useRouter()
    const { token } = useAuth()
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const hasInitialized = useRef(false)
    const currentStepRef = useRef(step)

    // Debug: Log cuando cambian los valores importantes
    useEffect(() => {
        console.log('[Step] Estado actual:', { step, mode, basePath, hasToken: !!token })
    }, [step, mode, basePath, token])

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
            console.log(`[Step ${step}] Sincronizando desde backend:`, {
                totalItems: content.length,
                seleccionados: preSelected.length,
                ids: preSelected.map(i => i.id),
                currentDataLength: currentData.length
            })
            
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
            if (current.length >= 5) {
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

     
        if (step === 3 && newSelection.length >= 3) {
            setError(null)
        }
    }

    const handleNext = async () => {
        const endpoint = getEndpoint()
        
        // Validar que basePath esté definido
        if (!basePath) {
            console.error('[Step] basePath no está definido')
            return
        }
        
        // NO saltar el guardado en el paso 3 - siempre debe guardar antes de avanzar
        if (!endpoint || !token) {
            // Si no hay endpoint o token, solo navegar (no debería pasar en modo edición)
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
            const skip = current.length === 0

            // Para paso 3 (gustos): el backend valida mínimo de 3 gustos
            // Permite lista vacía (0 gustos) pero rechaza 1-2 gustos
            if (step === 3) {
                if (current.length > 0 && current.length < 3) {
                    // NO intentar guardar si tiene 1-2 gustos (el backend lo rechazará)
                    // Solo mostrar error y NO avanzar
                    setError('Debes seleccionar al menos 3 gustos para continuar.')
                    return
                }
                // Si tiene 0 gustos (lista vacía) o 3+, intentar guardar
                // El backend permite lista vacía pero valida mínimo de 3 si hay gustos
            }

            // Usar PUT en modo edición, POST en modo registro
            const method = mode === 'edicion' ? 'PUT' : 'POST'
            console.log(`[Step ${step}] Guardando (${method}):`, { 
                ids, 
                idsLength: ids.length,
                idsType: typeof ids[0],
                selectedItems: current.map(i => ({ id: i.id, nombre: i.nombre })),
                skip, 
                endpoint, 
                mode 
            })

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ids,
                    skip,
                }),
            })

            if (!response.ok) {
                // Intentar leer como texto primero para parsear después
                const errorText = await response.text().catch(() => '')
                console.error(`[Step ${step}] Error guardando en backend:`, errorText)
                
                // Extraer el mensaje de error del backend
                let errorMessage = 'Error al guardar. Por favor intenta de nuevo.'
                
                // Intentar parsear como JSON
                try {
                    const errorData = errorText ? JSON.parse(errorText) : {}
                    if (errorData.message) {
                        errorMessage = errorData.message
                    } else if (errorData.error) {
                        errorMessage = errorData.error
                    } else if (typeof errorData === 'string') {
                        errorMessage = errorData
                    }
                } catch {
                    // Si no es JSON, usar el texto directo
                    if (errorText) {
                        errorMessage = errorText
                    }
                }
                
                setError(errorMessage)
                return // No avanzar si falla
            }

            const responseData = await response.json().catch(() => ({}))
            console.log(`[Step ${step}] Guardado exitoso (${method}):`, {
                responseData,
                idsEnviados: ids,
                selectedCount: current.length,
                mode
            })

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
                                {(selected as unknown as number[]).length}/5
                            </span>
                        </div>
                    </section>

                    <section className={styles.gridContainer}>
                        {filteredContent.map(({ id, nombre }) => {
                            // Comparar IDs correctamente (pueden ser string o number)
                            const isSelected = selected.some(
                                item => String(item.id) === String(id)
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