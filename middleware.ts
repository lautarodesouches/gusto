import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROUTES } from './routes'

export function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value
    const { pathname } = req.nextUrl

    // Rutas públicas
    const publicPaths = [
        ROUTES.HOME,
        ROUTES.LOGIN,
        ROUTES.REGISTER,
        ROUTES.REGISTER__RESTAURANT,
    ]

    // Si la ruta es pública, dejar pasar
    if (publicPaths.includes(pathname)) {
        return NextResponse.next()
    }

    // Si no hay token y la ruta no es pública, redirigir al login
    if (!token) {
        const url = req.nextUrl.clone()
        url.pathname = ROUTES.LOGIN
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    // Aplica el middleware a todas las rutas excepto las estáticas (como /_next, /api, etc.)
    matcher: ['/((?!_next/static|_next/image|favicon.ico|images|fonts|api).*)'],
}
