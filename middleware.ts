import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROUTES } from './routes'

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // Permitir siempre las rutas de autenticación y recursos públicos
    const publicPaths = ['/auth', '/_next', '/favicon.ico', '/api/public', '/images', '/fonts']

    // Si la ruta está en los paths públicos, no hacemos nada
    if (publicPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.next()
    }

    // Buscar token o sesión (por ejemplo, guardado en cookie)
    const token = req.cookies.get('token')?.value

    // Si no hay token, redirigir a /auth
    if (!token) {
        const url = req.nextUrl.clone()
        url.pathname = ROUTES.LOGIN
        return NextResponse.redirect(url)
    }

    // Si hay token, permitir acceso
    return NextResponse.next()
}

// Indicar qué rutas usa el middleware
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'], // Aplica a todas menos assets estáticos
}
