import { ROUTES } from '@/routes'
import { Metadata } from 'next'
import Form from './form'

export const metadata: Metadata = {
    title: 'Registrarse | Gusto',
    description: 'Creá tu cuenta en Gusto y empezá a descubrir los mejores lugares para comer con tus amigos.',
}
import { AuthContainer, AuthSocial } from '@/components'

export default function Register() {
    return (
        <>
            <AuthContainer
                subtitle="REGISTRO"
                title="BIENVENIDO"
                alt={{
                    text: 'Ya tienes cuenta?',
                    link__url: ROUTES.LOGIN,
                    link__text: 'INICIA SESIÓN',
                }}
            >
                <Form />
                <AuthSocial link="" mode="register" />
            </AuthContainer>
        </>
    )
}
