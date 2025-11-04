'use client'
import styles from './page.module.css'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/routes'
import { useRegister } from '@/context/RegisterContext'

export default function StepFour() {
    const router = useRouter()
    const { data } = useRegister()

    const handleFinish = async () => {
        try {
            // Validar que haya al menos 3 gustos
            const gustos = data.step3 || []
            if (gustos.length < 3) {
                alert('Debes seleccionar al menos 3 gustos para continuar. Por favor vuelve al paso 3.')
                return
            }
            
            console.log('Finalizando registro, enviando steps...', data)
            
            const response = await fetch('/api/steps', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json()
                console.error('Error al finalizar registro:', errorData)
                alert(`Error al guardar tus preferencias: ${errorData.details || errorData.error || 'Error desconocido'}`)
                return
            }

            const result = await response.json()
            console.log('Steps guardados correctamente:', result)
            
            router.push(ROUTES.MAP)
        } catch (error) {
            console.error('Error en handleFinish:', error)
            alert('Error al finalizar el registro. Por favor intenta de nuevo.')
        }
    }

    const handleBack = () => {
        router.push('/auth/register/step/3')
    }

    const renderSelections = (items?: { nombre: string }[]) => {
        if (!items || items.length === 0) return <p>No seleccionaste nada.</p>

        return (
            <ul className={styles.selectionList}>
                {items.map((item, index) => (
                    <li key={index} className={styles.selectionItem}>
                        {item.nombre}
                    </li>
                ))}
            </ul>
        )
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <p className={styles.stepLabel}>Paso 4</p>
                <h2 className={styles.title}>Verificación Final</h2>
                <p className={styles.description}>
                    Revisa que todo lo seleccionado sea correcto
                </p>
            </header>

            <section className={styles.reviewContainer}>
                <div className={styles.reviewCard}>
                    <h3 className={styles.reviewTitle}>
                        Alergias e intolerancias
                    </h3>
                    {renderSelections(data.step1)}
                </div>

                <div className={styles.reviewCard}>
                    <h3 className={styles.reviewTitle}>Condiciones médicas</h3>
                    {renderSelections(data.step2)}
                </div>

                <div className={styles.reviewCard}>
                    <h3 className={styles.reviewTitle}>
                        Tus preferencias de comida
                    </h3>
                    {renderSelections(data.step3)}
                </div>
            </section>

            <nav className={styles.actions}>
                <button onClick={handleBack} className={styles.backButton}>
                    VOLVER
                </button>
                <button onClick={handleFinish} className={styles.finishButton}>
                    FINALIZAR
                </button>
            </nav>
        </div>
    )
}
