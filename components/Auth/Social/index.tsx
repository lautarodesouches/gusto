'use client'

import styles from './page.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faGoogle,
} from '@fortawesome/free-brands-svg-icons'
import {
    GoogleAuthProvider,
    signInWithPopup,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/routes'
import { login } from '@/app/actions/login'
import { socialRegister } from '@/app/actions/social-register'
import { useToast } from '@/context/ToastContext'

interface Props {
    link: string
    mode?: 'login' | 'register'
}

export default function SocialAuth({ mode = 'login' }: Props) {
    const router = useRouter()
    const toast = useToast()

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider()

            const result = await signInWithPopup(auth, provider)
            const token = await result.user.getIdToken()

            // MODO LOGIN: Solo autenticar con Firebase y crear cookie de sesión
            if (mode === 'login') {
                const loginResult = await login(token)

                if (loginResult.success) {
                    window.location.href = ROUTES.MAP
                } else {
                    console.error('Error en login social:', loginResult.error)
                    toast.error(loginResult.error || 'Error al iniciar sesión')
                    await auth.signOut()
                }
                return
            }

            // MODO REGISTER: Registrar en backend y luego redirigir
            const user = result.user
            const displayName = user.displayName || ''
            const email = user.email || ''

            // Separar nombre y apellido (básico)
            const nameParts = displayName.split(' ')
            const nombre = nameParts[0] || 'Usuario'
            const apellido = nameParts.slice(1).join(' ') || 'Social'

            // Generar username base desde el email
            const username = email.split('@')[0]

            const registerResult = await socialRegister(token, {
                nombre,
                apellido,
                email,
                username
            })

            if (registerResult.success && registerResult.data) {
                if (registerResult.data.isNewUser) {
                    router.push(`${ROUTES.STEPS}/1`)
                } else {
                    window.location.href = ROUTES.MAP
                }
            } else {
                console.error('Error en registro social:', registerResult.error)
                await auth.signOut()
            }

        } catch (error) {
            console.error('Error authenticating with social provider:', error)
        }
    }

    return (
        <div className={styles.icons}>
            <div
                className={styles.icons__div}
                onClick={handleGoogleLogin}
                style={{ cursor: 'pointer' }}
            >
                <FontAwesomeIcon
                    icon={faGoogle}
                    className={styles.icons__icon}
                />
            </div>
        </div>
    )
}
