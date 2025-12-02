import { requireAdmin } from '@/app/actions/admin'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Panel de Administración | Gusto',
    description: 'Panel de administración para moderadores de Gusto.',
}
export const dynamic = 'force-dynamic'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Verificar que el usuario sea admin antes de renderizar
    await requireAdmin()

    return <>{children}</>
}

