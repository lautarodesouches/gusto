'use client'
import { useState } from 'react'
import styles from './page.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from '@fortawesome/free-regular-svg-icons'
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/routes'
import { login } from '../../actions/login'

interface FormData {
    email: string
    password: string
}

interface FirebaseErrorLike {
    code?: string
    message?: string
}

/**
 * Mapea códigos de error de Firebase a mensajes amigables en español
 */
function getFirebaseErrorMessage(error: FirebaseErrorLike): string {
    const errorMessages: Record<string, string> = {
        'auth/user-not-found': 'El usuario no existe.',
        'auth/wrong-password': 'Contraseña incorrecta.',
        'auth/invalid-email': 'Email inválido.',
        'auth/user-disabled': 'El usuario está deshabilitado.',
        'auth/invalid-credential': 'Credenciales inválidas.',
        'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde.',
        'auth/network-request-failed': 'Error de conexión. Verifica tu internet.',
        'auth/operation-not-allowed': 'Operación no permitida.',
    }

    if (error.code && errorMessages[error.code]) {
        return errorMessages[error.code]
    }

    return error.message || 'Error desconocido.'
}

export default function Form() {
    const router = useRouter()

    const [form, setForm] = useState<FormData>({
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
        // Limpiar error cuando el usuario empieza a escribir
        if (errorMessage) {
            setErrorMessage('')
        }
    }

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setErrorMessage('')

        try {
            // Validación básica del lado del cliente
            if (!form.email.trim()) {
                setErrorMessage('Por favor ingresa tu email.')
                return
            }
            if (!form.password.trim()) {
                setErrorMessage('Por favor ingresa tu contraseña.')
                return
            }

            // Autenticación con Firebase (debe ser en el cliente)
            const auth = getAuth()
            const userCredential = await signInWithEmailAndPassword(
                auth,
                form.email.trim(),
                form.password
            )

            // Obtener token de Firebase
            const firebaseToken = await userCredential.user.getIdToken()

            // Usar server action para verificar token y establecer cookie
            const result = await login(firebaseToken)

            if (result.success) {
                router.push(ROUTES.MAP)
            } else {
                setErrorMessage(result.error || 'Error al iniciar sesión.')
            }
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'code' in error) {
                const fbError = error as FirebaseErrorLike
                setErrorMessage(getFirebaseErrorMessage(fbError))
            } else if (error instanceof Error) {
                setErrorMessage(error.message || 'Error desconocido.')
            } else {
                setErrorMessage('Error desconocido. Por favor intenta nuevamente.')
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
