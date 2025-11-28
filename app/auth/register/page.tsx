import { ROUTES } from '@/routes'
import Form from './form'
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
