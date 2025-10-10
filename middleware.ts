import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { ROUTES } from './routes'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret'

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // Solo proteger la ruta /map
    if (pathname === '/map') {
        const token = req.cookies.get('token')?.value

        if (!token) {
            const url = req.nextUrl.clone()
            url.pathname = ROUTES.LOGIN
            return NextResponse.redirect(url)
        }

        try {
            // Validar JWT
            jwt.verify(token, JWT_SECRET)
            return NextResponse.next()
        } catch {
            const url = req.nextUrl.clone()
            url.pathname = '/auth'
            return NextResponse.redirect(url)
        }
    }

    // Todas las demás rutas son públicas
    return NextResponse.next()
}

export const config = {
    matcher: ['/map'], // Solo se ejecuta para /map
}