import Link from 'next/link'
import styles from './page.module.css'
import { ROUTES } from '@/routes'
import Form from './form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faApple,
    faFacebookF,
    faGoogle,
} from '@fortawesome/free-brands-svg-icons'
import Image from 'next/image'

export default function Register() {
    return (
        <div className={styles.register}>
            <div className={styles.register__main}>
                <header className={styles.header}>
                    <Image src='/images/brand/gusto-center-negative.svg' alt='Logo Gusto!' className={styles.header__img} width={200} height={200} priority />
                </header>
                <Form />
                <div className={styles.icons}>
                    <div className={styles.icons__div}>
                        <FontAwesomeIcon
                            icon={faGoogle}
                            className={styles.icons__icon}
                        />
                    </div>
                    <div className={styles.icons__div}>
                        <FontAwesomeIcon
                            icon={faApple}
                            className={styles.icons__icon}
                        />
                    </div>
                    <div className={styles.icons__div}>
                        <FontAwesomeIcon
                            icon={faFacebookF}
                            className={styles.icons__icon}
                        />
                    </div>
                </div>
                <div className={styles.alt}>
                    <span className={styles.alt__span}>
                        Ya tienes cuenta?{' '}
                        <Link href={ROUTES.LOGIN} className={styles.alt__link}>
                            INICIA SESIÓN
                        </Link>
                    </span>
                </div>
            </div>
            <aside className={styles.register__aside}></aside>
        </div>
    )
}
