import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Pago Exitoso | Gusto',
    description: 'Tu pago ha sido procesado correctamente. ¡Disfrutá de Gusto Premium!',
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children
}
