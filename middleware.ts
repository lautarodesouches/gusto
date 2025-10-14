import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROUTES } from './routes'
import { verifyFirebaseToken } from './lib/firebaseAdmin'

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // Solo proteger la ruta /map
    if (pathname === '/map') {
        const token = req.cookies.get('token')?.value

        if (!token || await verifyFirebaseToken(token)) {
            const url = req.nextUrl.clone()
            url.pathname = ROUTES.LOGIN
            return NextResponse.redirect(url)
        }

    }

    // Todas las demás rutas son públicas
    return NextResponse.next()
}

export const config = {
    matcher: ['/map'], // Solo se ejecuta para /map
}