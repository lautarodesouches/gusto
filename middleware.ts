import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROUTES } from './routes'

export function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value

    if (!token) {
        const url = req.nextUrl.clone()
        url.pathname = ROUTES.LOGIN
        return NextResponse.redirect(url)
    }

    // Todas las demás rutas son públicas
    return NextResponse.next()
}

export const config = {
    matcher: ['/map', '/group/:path*', '/auth/register/step/:path*'],
}
