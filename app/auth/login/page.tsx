import { ROUTES } from '@/routes'
import Form from './form'
import { AuthContainer, AuthSocial } from '@/components'

export default function Login() {
    return (
        <>
            <AuthContainer
                subtitle="INICIO DE SESIÓN"
                title="BIENVENIDO DE NUEVO"
                alt={{
                    text: 'No tienes cuenta?',
                    link__url: ROUTES.REGISTRO,
                    link__text: 'REGISTRATE',
                }}
            >
                <Form />
                <AuthSocial link="" />
            </AuthContainer>
        </>
    )
}
