'use client'
import { useState } from 'react'
import styles from './page.module.css'
import { AuthInput } from '@/components'
import { validateRegisterForm } from '@/lib/validation'
import { FormState } from '@/types'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/routes'
import { auth } from '@/lib/firebase'
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth'
import { register } from '../../actions/register'

const fields = [
    {
        name: 'email',
        type: 'email',
        placeholder: 'ejemplo@gmail.com',
    },
    {
        name: 'password',
        type: 'password',
        placeholder: 'Contraseña',
    },
    {
        name: 'repeat',
        type: 'password',
        placeholder: 'Repetir',
    },
    { name: 'name', type: 'text', placeholder: 'Nombre', isPassword: false },
    {
        name: 'lastname',
        type: 'text',
        placeholder: 'Apellido',
    },
    {
        name: 'username',
        type: 'text',
        placeholder: 'Usuario',
    },
] as const

interface FirebaseErrorLike {
    code?: string
    message?: string
}

/**
 * Mapea códigos de error de Firebase a mensajes amigables en español
 */
function getFirebaseErrorMessage(error: FirebaseErrorLike): string {
    const errorMessages: Record<string, string> = {
        'auth/email-already-in-use': 'El email ya está registrado.',
        'auth/weak-password': 'La contraseña es muy débil.',
        'auth/invalid-email': 'El email ingresado no es válido.',
        'auth/operation-not-allowed': 'Operación no permitida.',
        'auth/network-request-failed':
            'Error de conexión. Verifica tu internet.',
    }

    if (error.code && errorMessages[error.code]) {
        return errorMessages[error.code]
    }

    return error.message || 'Error desconocido.'
}

export default function Form() {
    const router = useRouter()
    const [form, setForm] = useState<FormState>(
        Object.fromEntries(
            fields.map(f => [f.name, { value: '', error: '' }])
        ) as FormState
    )
    const [isButtonDisabled, setIsButtonDisabled] = useState(false)
    const [globalError, setGlobalError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: { value, error: '' } }))
        // Limpiar error global cuando el usuario empieza a escribir
        if (globalError) {
            setGlobalError('')
        }
    }

    const setFieldError = (field: keyof FormState, message: string) => {
        setForm(prev => ({
            ...prev,
            [field]: { value: prev[field].value, error: message },
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsButtonDisabled(true)
        setGlobalError('')

        // Validación local
        const isValid = validateRegisterForm(form, setForm)
        if (!isValid) {
            setIsButtonDisabled(false)
            return
        }

        try {
            // Autenticación con Firebase (debe ser en el cliente)
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                form.email.value.trim(),
                form.password.value
            )
            const user = userCredential.user
            const idToken = await user.getIdToken()

            // Usar server action para registrar usuario y establecer cookie
            const result = await register(idToken, {
                nombre: form.name.value.trim(),
                apellido: form.lastname.value.trim(),
                email: form.email.value.trim(),
                username: form.username.value.trim(),
            })

            if (result.success) {
                router.push(`${ROUTES.STEPS}/1/`)
            } else {
                // Si falla el backend, eliminar la cuenta de Firebase
                try {
                    await deleteUser(user)
                } catch (deleteError) {
                    console.error('Error al eliminar cuenta de Firebase:', deleteError)
                }

                // Manejar errores del backend
                const errorMessage = result.error || 'Error en el registro'

                // Intentar mapear errores comunes del backend a campos específicos
                const lowerMessage = errorMessage.toLowerCase()
                
                // Detectar errores de username duplicado (más específico primero)
                if (
                    lowerMessage.includes('nombre de usuario') ||
                    (lowerMessage.includes('usuario') && lowerMessage.includes('en uso')) ||
                    (lowerMessage.includes('username') && (lowerMessage.includes('en uso') || lowerMessage.includes('already')))
                ) {
                    setFieldError('username', errorMessage)
                } else if (
                    lowerMessage.includes('email') ||
                    lowerMessage.includes('correo') ||
                    lowerMessage.includes('correo electrónico')
                ) {
                    setFieldError('email', errorMessage)
                } else if (
                    lowerMessage.includes('usuario') ||
                    lowerMessage.includes('username')
                ) {
                    setFieldError('username', errorMessage)
                } else {
                    setGlobalError(errorMessage)
                }
            }
        } catch (error: unknown) {
            // Manejar errores de Firebase
            if (error && typeof error === 'object' && 'code' in error) {
                const fbError = error as FirebaseErrorLike
                const errorMessage = getFirebaseErrorMessage(fbError)

                // Mapear errores de Firebase a campos específicos
                switch (fbError.code) {
                    case 'auth/email-already-in-use':
                        setFieldError('email', errorMessage)
                        break
                    case 'auth/weak-password':
                        setFieldError('password', errorMessage)
                        break
                    case 'auth/invalid-email':
                        setFieldError('email', errorMessage)
                        break
                    default:
                        setGlobalError(errorMessage)
                }
            } else if (error instanceof Error) {
                setGlobalError(error.message || 'Error desconocido.')
            } else {
                setGlobalError(
                    'Error inesperado. Por favor intenta nuevamente.'
                )
            }
        } finally {
            setIsButtonDisabled(false)
        }
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.form__grid}>
                {fields.map(f => {
                    const field = f.name as keyof FormState
                    return (
                        <AuthInput
                            key={f.name}
                            name={f.name}
                            type={f.type}
                            placeholder={f.placeholder}
                            value={form[field].value}
                            error={form[field].error}
                            onChange={handleChange}
                            isPassword={
                                f.name === 'password' || f.name === 'repeat'
                            }
                        />
                    )
                })}
            </div>

            {globalError && <span className={styles.error}>{globalError}</span>}

            <div className={styles.container}>
                <button className={styles.button} disabled={isButtonDisabled}>
                    Registrarme
                </button>
            </div>
        </form>
    )
}
