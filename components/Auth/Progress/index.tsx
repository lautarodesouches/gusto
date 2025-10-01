import styles from './page.module.css'

interface Props {
    steps?: number
    activeStep: number
}

export default function Progress({ steps = 4, activeStep }: Props) {
    return (
        <aside className={styles.timeline}>
            {Array.from({ length: steps }, (_, i) => {
                const step = i + 1
                const isActive = step === activeStep
                const isCompleted = step < activeStep

                return (
                    <div key={step} className={styles.stepWrapper}>
                        {/* Número del paso */}
                        <div
                            className={`${styles.step} ${
                                isActive
                                    ? styles.active
                                    : isCompleted
                                    ? styles.completed
                                    : ''
                            }`}
                        >
                            {step}
                        </div>

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
        </aside>
    )
}
