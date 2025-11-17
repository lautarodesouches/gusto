'use client'

import styles from './page.module.css'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/routes'
import { useRegister } from '@/context/RegisterContext'
import { PreventWrapper } from '../../PreventWrapper'
import { useEffect, useState, useRef } from 'react'
import { RegisterItem } from '@/types'
import { saveSteps } from '@/app/actions/steps'

export default function StepFour() {
    const router = useRouter()
    const { data, setData, basePath } = useRegister()
    const [loading, setLoading] = useState(true)
    const [displayData, setDisplayData] = useState<{
        step1?: RegisterItem[]
        step2?: RegisterItem[]
        step3?: RegisterItem[]
    }>({})
    const hasLoadedRef = useRef(false)

    // Cargar datos desde el backend al montar el componente
    useEffect(() => {
        // Solo cargar una vez
        if (hasLoadedRef.current) return
        hasLoadedRef.current = true

        const loadData = async () => {
            try {
                const response = await fetch(
                    '/api/usuario/resumen?modo=registro'
                )
                if (!response.ok) {
                    console.error('Error al cargar resumen del usuario')
                    // Si falla, usar datos del contexto como fallback
                    setDisplayData({
                        step1: data.step1,
                        step2: data.step2,
                        step3: data.step3,
                    })
                    setLoading(false)
                    return
                }

                const resumen = await response.json()

                // Mapear los datos del backend al formato esperado
                const step1Data =
                    resumen.restricciones?.map(
                        (item: { id: string; nombre: string }) => ({
                            id: item.id,
                            nombre: item.nombre,
                        })
                    ) || []

                const step2Data =
                    resumen.condicionesMedicas?.map(
                        (item: { id: string; nombre: string }) => ({
                            id: item.id,
                            nombre: item.nombre,
                        })
                    ) || []

                const step3Data =
                    resumen.gustos?.map(
                        (item: { id: string; nombre: string }) => ({
                            id: item.id,
                            nombre: item.nombre,
                        })
                    ) || []

                // Actualizar el contexto con los datos cargados
                setData({
                    step1: step1Data,
                    step2: step2Data,
                    step3: step3Data,
                })

                // Actualizar el estado local para mostrar
                setDisplayData({
                    step1: step1Data,
                    step2: step2Data,
                    step3: step3Data,
                })
            } catch (error) {
                console.error('Error cargando resumen:', error)
                // Si falla, usar datos del contexto como fallback
                setDisplayData({
                    step1: data.step1,
                    step2: data.step2,
                    step3: data.step3,
                })
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, []) // Solo ejecutar una vez al montar

    const handleFinish = async () => {
        try {
            // Usar displayData que tiene los datos más actualizados
            const gustos = displayData.step3 || data.step3 || []
            if (gustos.length < 3) {
                alert(
                    'Debes seleccionar al menos 3 gustos para continuar. Por favor vuelve al paso 3.'
                )
                return
            }

            const dataToSend = {
                step1: data.step1,
                step2: data.step2,
                step3: data.step3,
            }

            const result = await saveSteps(dataToSend)

            if (!result.success) {
                alert(result.error || 'Error al guardar tus preferencias')
                return
            }

            router.push(ROUTES.MAP)
        } catch (error) {
            console.error('Error al finalizar el registro:', error)
        }
    }

    const handleBack = () => {
        router.push(`${basePath}/3`)
    }

    const renderSelections = (items?: { nombre: string }[]) =>
        !items || items.length === 0 ? (
            <p>No seleccionaste nada.</p>
        ) : (
            <ul className={styles.selectionList}>
                {items.map((item, index) => (
                    <li key={index} className={styles.selectionItem}>
                        {item.nombre}
                    </li>
                ))}
            </ul>
        )

    return (
        <>
            {/* Prevenir acceso si no se han completado los pasos previos */}
            <PreventWrapper />

            <div className={styles.container}>
                <header className={styles.header}>
                    <p className={styles.stepLabel}>Paso 4</p>
                    <h2 className={styles.title}>Verificación Final</h2>
                    <p className={styles.description}>
                        Revisa que todo lo seleccionado sea correcto
                    </p>
                </header>

                <section className={styles.reviewContainer}>
                    {loading ? (
                        <div
                            style={{
                                color: 'var(--white)',
                                textAlign: 'center',
                                padding: '2rem',
                            }}
                        >
                            Cargando datos...
                        </div>
                    ) : (
                        <>
                            <div className={styles.reviewCard}>
                                <h3 className={styles.reviewTitle}>
                                    Alergias e intolerancias
                                </h3>
                                {renderSelections(
                                    displayData.step1 || data.step1
                                )}
                            </div>

                            <div className={styles.reviewCard}>
                                <h3 className={styles.reviewTitle}>
                                    Condiciones médicas
                                </h3>
                                {renderSelections(
                                    displayData.step2 || data.step2
                                )}
                            </div>

                            <div className={styles.reviewCard}>
                                <h3 className={styles.reviewTitle}>
                                    Tus preferencias de comida
                                </h3>
                                {renderSelections(
                                    displayData.step3 || data.step3
                                )}
                            </div>
                        </>
                    )}
                </section>

                <nav className={styles.actions}>
                    <button onClick={handleBack} className={styles.backButton}>
                        VOLVER
                    </button>
                    <button
                        onClick={handleFinish}
                        className={styles.finishButton}
                    >
                        FINALIZAR
                    </button>
                </nav>
            </div>
        </>
    )
}
