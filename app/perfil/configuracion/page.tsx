import { getCurrentUser } from '@/app/actions/profile'
import { Metadata } from 'next'
import ProfileConfigClient from '@/components/ProfileConfig/Client'

export const metadata: Metadata = {
    title: 'Configurar Perfil | Gusto',
    description: 'Personalizá tu perfil en Gusto. Cambiá tu foto, nombre y preferencias.',
}
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ConfigurationPage() {
    const result = await getCurrentUser()

    if (!result.success || !result.data) {
        notFound()
    }

    return <ProfileConfigClient profile={result.data} />
}

