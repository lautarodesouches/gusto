import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Pago Pendiente | Gusto',
    description: 'Tu pago está siendo procesado. Te notificaremos cuando se complete.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children
}
