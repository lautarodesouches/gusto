'use client'

import styles from './page.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faApple,
    faGoogle,
} from '@fortawesome/free-brands-svg-icons'
import {
    GoogleAuthProvider,
    OAuthProvider,
    signInWithPopup,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/routes'
import { socialLogin } from '@/app/actions/social-login'

interface Props {
    link: string
}

export default function SocialAuth({}: Props) {
    const router = useRouter()

    const handleSocialLogin = async (providerName: 'google' | 'apple') => {
        try {
            let provider
            switch (providerName) {
                case 'google':
                    provider = new GoogleAuthProvider()
                    break
                case 'apple':
                    provider = new OAuthProvider('apple.com')
                    break
            }

            // @ts-ignore
            const result = await signInWithPopup(auth, provider)
            const token = await result.user.getIdToken()
            const user = result.user

            // Extraer datos del usuario
            const displayName = user.displayName || ''
            const email = user.email || ''
            
            // Separar nombre y apellido (básico)
            const nameParts = displayName.split(' ')
            const nombre = nameParts[0] || 'Usuario'
            const apellido = nameParts.slice(1).join(' ') || 'Social'
            
            // Generar username base desde el email
            const username = email.split('@')[0]

            const loginResult = await socialLogin(token, {
                nombre,
                apellido,
                email,
                username
            })

            if (loginResult.success && loginResult.data) {
                if (loginResult.data.isNewUser) {
                    router.push(`${ROUTES.STEPS}/1`)
                } else {
                    router.push(ROUTES.MAP)
                }
            } else {
                console.error('Error en login social:', loginResult.error)
            }

        } catch (error) {
            console.error('Error authenticating with social provider:', error)
        }
    }

    return (
        <div className={styles.icons}>
            <div 
                className={styles.icons__div}
                onClick={() => handleSocialLogin('google')}
                style={{ cursor: 'pointer' }}
            >
                <FontAwesomeIcon
                    icon={faGoogle}
                    className={styles.icons__icon}
                />
            </div>
            <div 
                className={styles.icons__div}
                onClick={() => handleSocialLogin('apple')}
                style={{ cursor: 'pointer' }}
            >
                <FontAwesomeIcon
                    icon={faApple}
                    className={styles.icons__icon}
                />
            </div>
        </div>
    )
}
