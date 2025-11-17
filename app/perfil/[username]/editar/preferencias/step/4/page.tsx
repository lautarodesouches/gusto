'use client'

import styles from '../../../../../../auth/register/step/4/page.module.css'
import { useRouter, useParams } from 'next/navigation'
import { useRegister } from '@/context/RegisterContext'
import { useEffect, useState, useRef } from 'react'
import { RegisterItem } from '@/types'

export default function StepFour() {

    const router = useRouter()
    const params = useParams()
    const username = params.username as string

    const { data, setData, mode, basePath } = useRegister()

    const [loading, setLoading] = useState(true)
    const [displayData, setDisplayData] = useState<{
        step1?: RegisterItem[]
        step2?: RegisterItem[]
        step3?: RegisterItem[]
    }>({})

    const hasLoadedRef = useRef(false)

    
    useEffect(() => {
        if (hasLoadedRef.current) return
        hasLoadedRef.current = true

        const loadData = async () => {
            try {
                const response = await fetch('/api/usuario/resumen?modo=edicion')

                if (!response.ok) {
                    console.error('Error al cargar resumen del usuario')
                    setLoading(false)
                    return
                }

                const resumen = await response.json()

                const step1Data =
                    resumen.restricciones?.map((item: { id: string | number; nombre: string }) => ({
                        id: item.id,
                        nombre: item.nombre
                    })) || []

                const step2Data =
                    resumen.condicionesMedicas?.map((item: { id: string | number; nombre: string }) => ({
                        id: item.id,
                        nombre: item.nombre
                    })) || []

                // Los gustos usan GUIDs (strings), mantenerlos como strings
                const step3Data: RegisterItem[] =
                    resumen.gustos?.map((item: { id: string | number; nombre: string }) => ({
                        id: typeof item.id === 'string' ? item.id : String(item.id),
                        nombre: item.nombre
                    })) || []

console.log('[Step 4] Resumen OK:', {
    gustos: step3Data.map((g: RegisterItem) => g.nombre),
    ids: step3Data.map((g: RegisterItem) => g.id)
})


              
                setData({
                    step1: step1Data,
                    step2: step2Data,
                    step3: step3Data
                })

             
                setDisplayData({
                    step1: step1Data,
                    step2: step2Data,
                    step3: step3Data
                })

            } catch (error) {
                console.error('Error cargando resumen:', error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    const handleFinish = async () => {
        try {
            const gustos = displayData.step3 || []

            if (gustos.length < 3) {
                alert('Debes seleccionar al menos 3 gustos.')
                return
            }

            if (mode === 'edicion') {
                router.push(`/perfil/${username}`)
                return
            }

          
            const dataToSend = {
                step1: data.step1,
                step2: data.step2,
                step3: data.step3,
            }

            const response = await fetch('/api/steps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            })

            if (!response.ok) {
                const errorData = await response.json()
                alert(errorData.error || 'Error al guardar tus preferencias')
                return
            }

            router.push('/mapa/')
        } catch (error) {
            alert('Error al finalizar el registro')
        }
    }

    const handleBack = () => {
        router.push(`${basePath}/3`)
    }

    const renderSelections = (items?: { nombre: string }[]) => (
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
    )

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <p className={styles.stepLabel}>Paso 4</p>
                <h2 className={styles.title}>Verificación Final</h2>
                <p className={styles.description}>Revisa tus selecciones</p>
            </header>

            <section className={styles.reviewContainer}>
                {loading ? (
                    <div style={{ color: 'var(--white)', textAlign: 'center', padding: '2rem' }}>
                        Cargando datos...
                    </div>
                ) : (
                    <>
                        <div className={styles.reviewCard}>
                            <h3 className={styles.reviewTitle}>Alergias e intolerancias</h3>
                            {renderSelections(displayData.step1)}
                        </div>

                        <div className={styles.reviewCard}>
                            <h3 className={styles.reviewTitle}>Condiciones médicas</h3>
                            {renderSelections(displayData.step2)}
                        </div>

                        <div className={styles.reviewCard}>
                            <h3 className={styles.reviewTitle}>Tus preferencias de comida</h3>
                            {renderSelections(displayData.step3)}
                        </div>
                    </>
                )}
            </section>

            <nav className={styles.actions}>
                <button onClick={handleBack} className={styles.backButton}>VOLVER</button>
                <button onClick={handleFinish} className={styles.finishButton}>
                    {mode === 'edicion' ? 'CONFIRMAR' : 'FINALIZAR'}
                </button>
            </nav>
        </div>
    )
}
