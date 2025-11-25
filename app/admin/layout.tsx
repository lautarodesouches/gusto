import { requireAdmin } from '@/app/actions/admin'
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

