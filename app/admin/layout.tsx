import { requireAdmin } from './actions'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Verificar que el usuario sea admin antes de renderizar
    await requireAdmin()
    
    return <>{children}</>
}

