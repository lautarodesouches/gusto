import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Pago Fallido | Gusto',
    description: 'Hubo un problema con tu pago. Por favor, intentá nuevamente.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children
}
