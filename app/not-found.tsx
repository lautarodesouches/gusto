'use client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './not-found.module.css'

export default function NotFound() {
    const router = useRouter()

    const handleGoHome = () => {
        // Intentar ir a la página anterior si existe historial
        if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back()
        } else {
            // Si no hay historial, ir al mapa (home)
            router.push('/mapa')
        }
    }

    return (
        <main className={styles.container}>
            <div className={styles.cableContainer}>
                <Image
                    src="/images/all/cable_404.svg"
                    alt="Cable decorativo"
                    width={800}
                    height={100}
                    className={styles.cable}
                    priority
                />
            </div>

            <div className={styles.content}>
                <div className={styles.errorImageContainer}>
                    <Image
                        src="/images/all/404.svg"
                        alt="404 Error"
                        width={400}
                        height={200}
                        className={styles.errorImage}
                        priority
                    />
                </div>

                <p className={styles.message}>
                    No pudimos encontrar la página<br />
                    que estabas buscando
                </p>

                <button className={styles.button} onClick={handleGoHome}>
                    REGRESAR
                </button>
            </div>
        </main>
    )
}

