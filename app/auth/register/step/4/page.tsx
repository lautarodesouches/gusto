'use client'
import styles from './page.module.css'
import { useRegister } from '@/context/RegisterContext'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/routes'

export default function StepFour() {
    const router = useRouter()
    
    const handleFinish = () => {
        // La funcionalidad del backend ya está implementada
        router.push(ROUTES.HOME)
    }

    const handleBack = () => {
        router.push('/auth/register/step/3')
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <p className={styles.stepLabel}>Paso 4</p>
                <h2 className={styles.title}>Verificación Final</h2>
                <p className={styles.description}>
                    Revisa que todo lo seleccionado sea correcto
                </p>
            </div>

            <div className={styles.reviewContainer}>
                <div className={styles.reviewCard}>
                    <h3 className={styles.reviewTitle}>Tus preferencias de comida</h3>
                    <p className={styles.reviewText}>
                        Aquí se mostrarán tus selecciones del paso 1
                    </p>
                </div>

                <div className={styles.reviewCard}>
                    <h3 className={styles.reviewTitle}>Alergias e intolerancias</h3>
                    <p className={styles.reviewText}>
                        Aquí se mostrarán tus selecciones del paso 2
                    </p>
                </div>

                <div className={styles.reviewCard}>
                    <h3 className={styles.reviewTitle}>Condiciones médicas</h3>
                    <p className={styles.reviewText}>
                        Aquí se mostrarán tus selecciones del paso 3
                    </p>
                </div>
            </div>

            <div className={styles.actions}>
                <button onClick={handleBack} className={styles.backButton}>
                    VOLVER
                </button>
                <button onClick={handleFinish} className={styles.finishButton}>
                    FINALIZAR
                </button>
            </div>
        </div>
    )
}