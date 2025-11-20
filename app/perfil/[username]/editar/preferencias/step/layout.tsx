'use client'
import { RegisterProvider } from '@/context/RegisterContext'
import styles from '../../../../../auth/register/step/page.module.css'
import { AuthProgress } from '@/components'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { useRegister } from '@/context/RegisterContext'

interface Props {
    children: React.ReactNode
}

function LayoutContent({ children }: { children: React.ReactNode }) {
    const params = useParams()
    const username = params.username as string
    const { setBasePath, setMode } = useRegister()
    const basePath = `/perfil/${username}/editar/preferencias/step`

    // Asegurar que el basePath y mode se establezcan correctamente
    useEffect(() => {
        setBasePath(basePath)
        setMode('edicion')
    }, [basePath, setBasePath, setMode])

    return (
        <div className={`${styles.wrapper} step-layout`}>
            <header className={styles.header}>
                <Image
                    src="/images/brand/gusto-center-negative.svg"
                    alt="Logo Gusto!"
                    className={styles.logo}
                    width={120}
                    height={40}
                    priority
                />
            </header>
            <div className={styles.container}>
                <aside className={styles.progress}>
                    <AuthProgress />
                </aside>
                <div className={styles.content}>{children}</div>
            </div>
        </div>
    )
}

export default function Layout({ children }: Props) {
    const params = useParams()
    const username = params.username as string
    const basePath = `/perfil/${username}/editar/preferencias/step`

    return (
        <RegisterProvider mode="edicion" basePath={basePath}>
            <LayoutContent>{children}</LayoutContent>
        </RegisterProvider>
    )
}

