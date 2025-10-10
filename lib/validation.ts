import { FormState } from '@/types'

export const validateRegisterForm = (
    form: FormState,
    setForm: React.Dispatch<React.SetStateAction<FormState>>
): boolean => {
    let valid = true
    const newForm: FormState = { ...form }

    if (!form.email.value) {
        newForm.email.error = 'El email es obligatorio'
        valid = false
    } else if (!/\S+@\S+\.\S+/.test(form.email.value)) {
        newForm.email.error = 'El email no es válido'
        valid = false
    } else {
        newForm.email.error = ''
    }

    if (!form.password.value) {
        newForm.password.error = 'La contraseña es obligatoria'
        valid = false
    } else if (form.password.value.length < 6) {
        newForm.password.error = 'Debe tener al menos 6 caracteres'
        valid = false
    } else {
        newForm.password.error = ''
    }

    if (form.repeat.value !== form.password.value) {
        newForm.repeat.error = 'Las contraseñas no coinciden'
        valid = false
    } else {
        newForm.repeat.error = ''
    }

    if (!form.name.value) {
        newForm.name.error = 'El nombre es obligatorio'
        valid = false
    } else {
        newForm.name.error = ''
    }

    if (!form.lastname.value) {
        newForm.lastname.error = 'El apellido es obligatorio'
        valid = false
    } else {
        newForm.lastname.error = ''
    }

    if (!form.username.value) {
        newForm.username.error = 'El usuario es obligatorio'
        valid = false
    } else {
        newForm.username.error = ''
    }

    setForm(newForm)
    return valid
}
