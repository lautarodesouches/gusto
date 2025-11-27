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
        
        const tokenClaims = decodedToken as { rol?: string | number; role?: string | number; [key: string]: unknown }
        
        // Log para depuración
        console.log('[API /usuario/rol] 🔍 Token claims completos:', JSON.stringify(tokenClaims, null, 2))
        console.log('[API /usuario/rol] 🔍 Claim "rol":', tokenClaims.rol, 'tipo:', typeof tokenClaims.rol)
        console.log('[API /usuario/rol] 🔍 Claim "role":', tokenClaims.role, 'tipo:', typeof tokenClaims.role)
        
        // Mapear número a string si es necesario
        let rol: string
        const rolValue = tokenClaims.rol || tokenClaims.role
        
        if (rolValue !== undefined && rolValue !== null) {
            const rolString = String(rolValue).trim()
            
            // Si es número, mapear a string del enum
            if (typeof rolValue === 'number') {
                if (rolValue === 3) {
                    rol = 'Admin'
                    console.log('[API /usuario/rol] ✅ Rol Admin detectado (número 3)')
                } else if (rolValue === 2) {
                    rol = 'DuenoRestaurante'
                } else if (rolValue === 1) {
                    rol = 'PendienteRestaurante'
                } else {
                    rol = 'Usuario'
                }
            } 
            // Si es string "3", "2", "1" mapear a nombre del enum
            else if (rolString === '3' || rolString === '2' || rolString === '1') {
                if (rolString === '3') {
                    rol = 'Admin'
                    console.log('[API /usuario/rol] ✅ Rol Admin detectado (string "3")')
                } else if (rolString === '2') {
                    rol = 'DuenoRestaurante'
                } else if (rolString === '1') {
                    rol = 'PendienteRestaurante'
                } else {
                    rol = 'Usuario'
                }
            }
            // Si es string con nombre del enum, usar directamente
            else {
                rol = rolString
                console.log('[API /usuario/rol] ✅ Rol detectado como string:', rol)
            }
        } else {
            rol = 'Usuario'
            console.log('[API /usuario/rol] ⚠️ No se encontró claim de rol, usando Usuario por defecto')
        }
        
        console.log('[API /usuario/rol] ✅ Rol final retornado:', rol)
        return NextResponse.json({ rol }, { status: 200 })
    } catch (error) {
        console.error('Error obteniendo rol del usuario:', error)
        return NextResponse.json({ rol: 'Usuario' }, { status: 200 })
    }
}

