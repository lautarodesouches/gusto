import { ROUTES } from '@/routes'
import { Metadata } from 'next'
import Form from './form'

export const metadata: Metadata = {
    title: 'Registro Restaurante | Gusto',
    description: 'Registrá tu restaurante en Gusto y empezá a recibir clientes.',
}
import { AuthContainer, AuthSocial } from '@/components'

export default function Register() {
    return (
        <>
            <AuthContainer
                subtitle="REGISTRO RESTAURANTE"
                title="BIENVENIDO"
                alt={{
                    text: 'Ya tienes cuenta?',
                    link__url: ROUTES.LOGIN,
                    link__text: 'INICIA SESIÓN',
                }}
            >
                <Form />
                <AuthSocial link="" />
            </AuthContainer>
        </>
    )
}
