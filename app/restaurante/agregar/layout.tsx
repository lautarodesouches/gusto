import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Agregar Restaurante | Gusto',
    description: 'Sumá tu restaurante a Gusto y llegá a más clientes.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children
}
