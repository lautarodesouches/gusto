'use client'
import { useState } from 'react'
import styles from './page.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faEnvelope,
    faEye,
} from '@fortawesome/free-regular-svg-icons'

interface Form {
    email: string
    password: string
}

export default function Form() {
    const [form, setForm] = useState<Form>({
        email: '',
        password: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(prevForm => ({
            ...prevForm,
            [name]: value,
        }))
    }

    return (
        <form className={styles.form}>
            <div className={styles.form__grid}>
                <div className={styles.form__group}>
                    <FontAwesomeIcon
                        icon={faEnvelope}
                        className={styles.form__icon}
                    />
                    <input
                        name="email"
                        type="email"
                        placeholder="ejemplo@gmail.com"
                        className={styles.form__input}
                        value={form.email}
                        onChange={handleChange}
                    />
                </div>
                <div className={styles.form__group}>
                    <FontAwesomeIcon
                        icon={faEye}
                        className={styles.form__icon}
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Contraseña"
                        className={styles.form__input}
                        value={form.password}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div className={styles.container}>
                <button className={styles.button}>Iniciar Sesión</button>
            </div>
        </form>
    )
}
