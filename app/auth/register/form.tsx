'use client'
import { useState } from 'react'
import styles from './page.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faEnvelope,
    faEye,
    faEyeSlash,
} from '@fortawesome/free-regular-svg-icons'

interface Form {
    email: string
    password: string
    repeat: string
    name: string
    lastname: string
    username: string
}

export default function Form() {
    const [form, setForm] = useState<Form>({
        email: '',
        password: '',
        repeat: '',
        name: '',
        lastname: '',
        username: '',
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
            <h3 className={styles.form__subtitle}>Registro</h3>
            <h2 className={styles.form__title}>Bienvenido</h2>
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
                    <input
                        name="password"
                        type="password"
                        placeholder="Contraseña"
                        className={styles.form__input}
                        value={form.password}
                        onChange={handleChange}
                    />
                    <FontAwesomeIcon
                        icon={faEye}
                        className={styles.form__icon}
                    />
                </div>
                <div className={styles.form__group}>
                    <input
                        name="repeat"
                        type="password"
                        placeholder="Repetir"
                        className={styles.form__input}
                        value={form.repeat}
                        onChange={handleChange}
                    />
                    <FontAwesomeIcon
                        icon={faEyeSlash}
                        className={styles.form__icon}
                    />
                </div>
                <div className={styles.form__group}>
                    <input
                        name="name"
                        type="text"
                        placeholder="Nombre"
                        className={styles.form__input}
                        value={form.name}
                        onChange={handleChange}
                    />
                </div>
                <div className={styles.form__group}>
                    <input
                        name="lastname"
                        type="text"
                        placeholder="Apellido"
                        className={styles.form__input}
                        value={form.lastname}
                        onChange={handleChange}
                    />
                </div>
                <div className={styles.form__group}>
                    <input
                        name="username"
                        type="text"
                        placeholder="Usuario"
                        className={styles.form__input}
                        value={form.username}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div className={styles.container}>
                <button className={styles.button}>Registrarme</button>
            </div>
        </form>
    )
}
