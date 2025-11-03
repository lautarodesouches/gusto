'use client'
import { useRouter } from 'next/navigation'
import styles from './styles.module.css'

export default function NotFound() {

    const router = useRouter()

    const handleGoBack = () => {
        router.back()
    }

    return (
        <main className={styles.not}>
            <h2 className={styles.not__title}>Perfil no encontrado</h2>
            <p className={styles.not__text}>
                Lo sentimos, no pudimos encontrar el perfil que estas buscando.
                Puede que el usuario no exista o haya sido eliminado.
            </p>
            <div className={styles.not__suggestions}>
                <h2 className={styles.not__subtitle}>¿Qué puedes hacer?</h2>
                <ul className={styles.not__list}>
                    <li className={styles.not__item}>
                        Verifica que el nombre de usuario esté escrito
                        correctamente
                    </li>
                    <li className={styles.not__item}>
                        Busca al usuario desde la sección social
                    </li>
                    <li className={styles.not__item}>
                        Vuelve al inicio y explora otros perfiles
                    </li>
                </ul>
            </div>
            <button className={styles.not__button} onClick={handleGoBack}>Volver atras</button>
        </main>
    )
}
