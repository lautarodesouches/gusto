'use client'
import { useState } from 'react'
import styles from './page.module.css'
import { AuthInput } from '@/components'
import { validateRegisterForm } from '@/lib/validation'
import { FormState } from '@/types'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/routes'
import { auth } from '@/lib/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'

const fields = [
    {
        name: 'email',
        type: 'email',
        placeholder: 'ejemplo@gmail.com',
        isPassword: false,
    },
    {
        name: 'password',
        type: 'password',
        placeholder: 'Contraseña',
        isPassword: true,
    },
    {
        name: 'repeat',
        type: 'password',
        placeholder: 'Repetir',
        isPassword: true,
    },
    { name: 'name', type: 'text', placeholder: 'Nombre', isPassword: false },
    {
        name: 'lastname',
        type: 'text',
        placeholder: 'Apellido',
        isPassword: false,
    },
    {
        name: 'username',
        type: 'text',
        placeholder: 'Usuario',
        isPassword: false,
    },
]

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
            // Firebase
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                form.email.value,
                form.password.value
            )
            const user = userCredential.user
            const idToken = await user.getIdToken()

            // Registro en backend
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: form.name.value,
                    apellido: form.lastname.value,
                    email: form.email.value,
                    username: form.username.value,
                    firebaseToken: idToken,
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                console.error('Error en el registro externo:', {
                    status: res.status,
                    statusText: res.statusText,
                    errorData: data
                })
                throw new Error(data.error || data.message || 'Error en el registro')
            }

            console.log('Registro exitoso, redirigiendo a steps...')
            router.push(`${ROUTES.STEPS}/1/`)
        } catch (error: unknown) {
            type FirebaseErrorLike = { code?: string; message: string }

            if (error && typeof error === 'object' && 'code' in error) {
                const fbError = error as FirebaseErrorLike
                switch (fbError.code) {
                    case 'auth/email-already-in-use':
                        setFieldError('email', 'El email ya está registrado.')
                        break
                    case 'auth/weak-password':
                        setFieldError('password', 'La contraseña es muy débil.')
                        break
                    case 'auth/invalid-email':
                        setFieldError(
                            'email',
                            'El email ingresado no es válido.'
                        )
                        break
                    default:
                        setGlobalError(fbError.message)
                }
            } else if (error instanceof Error) {
                setGlobalError(error.message)
            } else {
                setGlobalError('Error inesperado')
            }
            console.error('Registro falló:', error)
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
                            isPassword={f.isPassword}
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
