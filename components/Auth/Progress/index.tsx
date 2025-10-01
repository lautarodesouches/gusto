'use client'
import styles from './page.module.css'
import { useStep } from '@/hooks/useStep'

interface Props {
    steps?: number
}

export default function Progress({ steps = 4 }: Props) {
    const activeStep = useStep()

    return (
        <div className={styles.timeline}>
            {Array.from({ length: steps }, (_, i) => {
                const step = i + 1
                const isActive = step === activeStep
                const isCompleted = step < activeStep

                return (
                    <div key={step} className={styles.stepWrapper}>
                        {/* Número del paso */}
                        <span
                            className={`${styles.step} ${
                                isActive
                                    ? styles.active
                                    : isCompleted
                                    ? styles.completed
                                    : ''
                            }`}
                        >
                            {step}
                        </span>

                        {/* Línea con animación */}
                        {step < steps && (
                            <div className={styles.line}>
                                <div
                                    className={`${styles.lineFill} ${
                                        isCompleted
                                            ? styles.fillFull
                                            : isActive
                                            ? styles.fillPartial
                                            : ''
                                    }`}
                                />
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
