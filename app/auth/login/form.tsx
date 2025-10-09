'use client'
import { useState } from 'react'
import styles from './page.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from '@fortawesome/free-regular-svg-icons'
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons'

interface Form {
    email: string
    password: string
}

export default function Form() {
    const [form, setForm] = useState<Form>({
        email: '',
        password: '',
    })

    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(prevForm => ({
            ...prevForm,
            [name]: value,
        }))
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    return (
        <form className={styles.form}>
            <div className={styles.form__grid}>
                <div className={styles.form__group}>
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
                    <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Contraseña"
                        className={styles.form__input}
                        value={form.password}
                        onChange={handleChange}
                    />
                    <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                        className={styles.form__icon__toggle}
                        onClick={togglePasswordVisibility}
                    />
                </div>
            </div>
            <div className={styles.container}>
                <button className={styles.button}>Iniciar Sesión</button>
            </div>
        </form>
    )
}
