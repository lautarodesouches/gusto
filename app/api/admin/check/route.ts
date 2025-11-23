import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import admin from '@/lib/firebaseAdmin'


export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json({ isAdmin: false }, { status: 200 })
        }

        const decodedToken = await admin.auth().verifyIdToken(token)
        
      
        const tokenClaims = decodedToken as { admin?: boolean; rol?: string; [key: string]: unknown }
        
        const isAdmin = 
            tokenClaims.admin === true || 
            tokenClaims.rol === 'admin' || 
            tokenClaims.rol === 'Admin' ||
            (tokenClaims as { [key: string]: unknown })['admin'] === true ||
            (tokenClaims as { [key: string]: unknown })['isAdmin'] === true
        
        return NextResponse.json({ isAdmin: Boolean(isAdmin) }, { status: 200 })
    } catch (error) {
        console.error('Error verificando claim de admin:', error)
        return NextResponse.json({ isAdmin: false }, { status: 200 })
    }
}

