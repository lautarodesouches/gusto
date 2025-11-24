import { redirect } from 'next/navigation'
import { ROUTES } from '@/routes'

interface Props {
    params: Promise<{ username: string }>
}

export default async function Profile({ params }: Props) {
    const { username } = await params
    
    // Si el username es "configuracion", no procesar aquí (debe ir a la ruta estática)
    if (username === 'configuracion') {
        // O manejarlo como sea necesario
        return null
    }
    
    redirect(`${ROUTES.MAP}?profile=${username}`)
}