'use client'

import { useEffect, useState } from 'react'
import styles from './PaymentSuccess.module.css'

interface PaymentSuccessProps {
    show: boolean
    onComplete?: () => void
}

export default function PaymentSuccess({ show, onComplete }: PaymentSuccessProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (show) {
            // Mostrar inmediatamente
            setIsVisible(true)

            // Ocultar después de 3 segundos
            const timer = setTimeout(() => {
                setIsVisible(false)
                
                // Llamar onComplete después de la animación de salida
                setTimeout(() => {
                    onComplete?.()
                }, 300) // Tiempo de la animación de salida
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [show, onComplete])

    if (!show) return null

    return (
        <div className={`${styles.pantalla} ${isVisible ? styles.visible : styles.saliendo}`}>
            <div className={styles.contenido}>
                {/* Check animado desde archivo SVG */}
                <div className={styles.check_contenedor}>
                    <img 
                        src="/images/all/check pago.svg" 
                        alt="Pago exitoso" 
                        className={styles.check_svg}
                    />
                </div>

                {/* Título sin emoji */}
                <h1 className={styles.titulo}>¡Pago Exitoso!</h1>

                {/* Mensaje */}
                <p className={styles.mensaje}>
                    Ahora tienes acceso <span className={styles.premium_text}>Premium</span>
                </p>

                {/* Submensaje */}
                <p className={styles.submensaje}>
                    Puedes crear grupos ilimitados
                </p>
            </div>

            {/* Barra de progreso inferior - pegada y gruesa */}
            <div className={styles.barra_container}>
                <p className={styles.barra_texto}>Redirigiendo...</p>
                <div className={styles.barra_fondo}>
                    <div className={styles.barra_progreso}></div>
                </div>
            </div>
        </div>
    )
}
