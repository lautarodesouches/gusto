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

        const tokenClaims = decodedToken as { rol?: string | number; role?: string | number;[key: string]: unknown }



        // Mapear número a string si es necesario
        let rol: string
        const rolValue = tokenClaims.rol || tokenClaims.role

        if (rolValue !== undefined && rolValue !== null) {
            const rolString = String(rolValue).trim()

            // Si es número, mapear a string del enum
            if (typeof rolValue === 'number') {
                if (rolValue === 3) {
                    rol = 'Admin'
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
            }
        } else {
            rol = 'Usuario'
        }


        return NextResponse.json({ rol }, { status: 200 })
    } catch (error) {
        console.error('Error obteniendo rol del usuario:', error)
        return NextResponse.json({ rol: 'Usuario' }, { status: 200 })
    }
}

