'use client'
import styles from './page.module.css'

interface Props {
    aStep: number
    handleClick: (number: number) => void
}

export default function Progress({ aStep, handleClick }: Props) {
    return (
        <div className={styles.timeline}>
            {Array.from({ length: 3 }, (_, i) => {
                const step = i + 1
                const isActive = step === aStep
                const isCompleted = step < aStep

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
                            onClick={() => handleClick(step)}
                        >
                            {step}
                        </span>

                        {/* Línea con animación */}
                        {step < 4 && (
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
