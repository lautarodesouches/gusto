import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import admin from '@/lib/firebaseAdmin'


export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json({ rol: 'Usuario' }, { status: 200 })
        }

        const decodedToken = await admin.auth().verifyIdToken(token)
        

        const tokenClaims = decodedToken as { rol?: string; role?: string; [key: string]: unknown }
        
 
        const rol = tokenClaims.rol || tokenClaims.role || 'Usuario'
        
        return NextResponse.json({ rol: String(rol) }, { status: 200 })
    } catch (error) {
        console.error('Error obteniendo rol del usuario:', error)
        return NextResponse.json({ rol: 'Usuario' }, { status: 200 })
    }
}

