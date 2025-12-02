import { ROUTES } from '@/routes'
import { Metadata } from 'next'
import Form from './form'

export const metadata: Metadata = {
    title: 'Iniciar Sesión | Gusto',
    description: 'Iniciá sesión en Gusto para encontrar restaurantes y votar con amigos.',
}
import { AuthContainer, AuthSocial } from '@/components'

export default function Login() {
    return (
        <>
            <AuthContainer
                subtitle="INICIO DE SESIÓN"
                title="BIENVENIDO DE NUEVO"
                alt={{
                    text: 'No tienes cuenta?',
                    link__url: ROUTES.REGISTER,
                    link__text: 'REGISTRATE',
                }}
            >
                <Form />
                <AuthSocial link="" mode="login" />
            </AuthContainer>
        </>
    )
}
