'use client'
import { useState } from 'react'
import styles from './page.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from '@fortawesome/free-regular-svg-icons'
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/routes'

interface Form {
    email: string
    password: string
}

export default function Form() {
    const router = useRouter()

    const [form, setForm] = useState<Form>({
        email: '',
        password: '',
    })
    const [errorMessage, setErrorMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setErrorMessage('')

        try {
            const auth = getAuth()
            const userCredential = await signInWithEmailAndPassword(
                auth,
                form.email,
                form.password
            )

            // Obtener token
            const firebaseToken = await userCredential.user.getIdToken()

            // Mandar al backend para setear cookie
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firebaseToken }),
            })

            const data = await res.json()

            if (res.ok && data.success) {
                router.push(ROUTES.MAP)
            } else {
                setErrorMessage(data.error || 'Error desconocido')
            }
        } catch (error: unknown) {
            // Mapear los códigos de Firebase a mensajes amigables
            if (
                typeof error === 'object' &&
                error !== null &&
                'code' in error
            ) {
                const firebaseError = error as {
                    code: string
                    message?: string
                }
                switch (firebaseError.code) {
                    case 'auth/user-not-found':
                        setErrorMessage('El usuario no existe.')
                        break
                    case 'auth/wrong-password':
                        setErrorMessage('Contraseña incorrecta.')
                        break
                    case 'auth/invalid-email':
                        setErrorMessage('Email inválido.')
                        break
                    case 'auth/user-disabled':
                        setErrorMessage('El usuario está deshabilitado.')
                        break
                    case 'auth/invalid-credential':
                        setErrorMessage('Credenciales inválidas.')
                        break
                    default:
                        setErrorMessage(
                            firebaseError.message || 'Error desconocido.'
                        )
                }
            } else {
                setErrorMessage('Error desconocido.')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
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
            {errorMessage && (
                <span className={styles.error}>{errorMessage}</span>
            )}
            <div className={styles.container}>
                <button className={styles.button} disabled={isSubmitting}>
                    {isSubmitting ? 'Ingresando...' : 'Iniciar Sesión'}
                </button>
            </div>
        </form>
    )
}
