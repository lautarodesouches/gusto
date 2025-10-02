'use client'
import { useState } from 'react'
import styles from './page.module.css'
import { AuthInput } from '@/components'
import { validateForm } from '@/lib/validation'
import { registerUser } from '@/lib/register'
import { FormState } from '@/types'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/routes'

const fields = [
    { name: 'email', type: 'email', placeholder: 'ejemplo@gmail.com' },
    { name: 'password', type: 'password', placeholder: 'Contraseña' },
    { name: 'repeat', type: 'password', placeholder: 'Repetir' },
    { name: 'name', type: 'text', placeholder: 'Nombre' },
    { name: 'lastname', type: 'text', placeholder: 'Apellido' },
    { name: 'username', type: 'text', placeholder: 'Usuario' },
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsButtonDisabled(true)

        const isValid = validateForm(form, setForm)
        if (!isValid) {
            setIsButtonDisabled(false)
            return
        }

        try {
            const data = await registerUser({
                nombre: form.name.value,
                apellido: form.lastname.value,
                email: form.email.value,
                fotoPerfilUrl: '',
                idUsuario: 0,
            })

            console.log('Usuario registrado con éxito ✅', data)

            router.push(`${ROUTES.STEPS}/1/`)
        } catch (error) {
            console.error(error)
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
                    />
                ))}
            </div>
            <div className={styles.container}>
                <button className={styles.button} disabled={isButtonDisabled}>
                    Registrarme
                </button>
            </div>
        </form>
    )
}
