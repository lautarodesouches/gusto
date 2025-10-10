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

    const [form, setForm] = useState<FormState>({
        email: { value: '', error: '' },
        password: { value: '', error: '' },
        repeat: { value: '', error: '' },
        name: { value: '', error: '' },
        lastname: { value: '', error: '' },
        username: { value: '', error: '' },
    })

    const [isButtonDisabled, setIsButtonDisabled] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: { value, error: '' },
        }))
    }

    const handleError = (field: keyof FormState, message: string) => {
        setForm(prev => ({
            ...prev,
            [field]: { value: prev[field].value, error: message },
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsButtonDisabled(true)

        const isValid = validateRegisterForm(form, setForm)
        if (!isValid) {
            setIsButtonDisabled(false)
            return
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                form.email.value,
                form.password.value
            )

            const user = userCredential.user

            const idToken = await user.getIdToken()

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
                redirect: 'manual',
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Error en el registro')
            }

            router.push(`${ROUTES.STEPS}/1/`)
        } catch (error: unknown) {
            if (error instanceof Error) {
                if ('code' in error) {
                    const fbError = error as { code: string; message: string }
                    switch (fbError.code) {
                        case 'auth/email-already-in-use':
                            handleError('email', 'El email ya está registrado.')
                            break
                        case 'auth/weak-password':
                            handleError(
                                'password',
                                'La contraseña es muy débil.'
                            )
                            break
                        case 'auth/invalid-email':
                            handleError(
                                'email',
                                'El email ingresado no es válido.'
                            )
                            break
                    }
                }
            }

            console.error('Registro falló:', error)
        } finally {
            setIsButtonDisabled(false)
        }
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.form__grid}>
                {fields.map(field => (
                    <AuthInput
                        key={field.name}
                        name={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={form[field.name as keyof FormState].value}
                        error={form[field.name as keyof FormState].error}
                        onChange={handleChange}
                        isPassword={field.isPassword}
                    />
                ))}
            </div>
            <span className={styles.error}>{}</span>
            <div className={styles.container}>
                <button className={styles.button} disabled={isButtonDisabled}>
                    Registrarme
                </button>
            </div>
        </form>
    )
}
