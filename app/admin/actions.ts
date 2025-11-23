'use server'

import { cookies } from 'next/headers'
import admin from '@/lib/firebaseAdmin'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/routes'

/**
 * Verifica si el usuario actual tiene el claim de admin
 * @returns true si es admin, false si no lo es
 */
export async function checkIsAdmin(): Promise<boolean> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return false
        }

        const decodedToken = await admin.auth().verifyIdToken(token)
        
        // Verificar el claim de admin
        // Firebase almacena los claims personalizados directamente en el token decodificado
        // El backend usa [Authorize(Policy = "Admin")] que verifica el claim 'admin' o 'rol'
        const tokenClaims = decodedToken as { admin?: boolean; rol?: string; role?: string; [key: string]: unknown }
        
        // Verificar diferentes formas en que puede venir el claim de admin
        // El claim en Firebase es 'rol' (en español) con valor 'Admin'
        const isAdmin = 
            tokenClaims.admin === true || 
            tokenClaims.rol === 'admin' || 
            tokenClaims.rol === 'Admin' ||
            tokenClaims.rol === 'ADMIN' ||
            tokenClaims.rol === 'Administrator' ||
            // También verificar 'role' por compatibilidad
            tokenClaims.role === 'admin' || 
            tokenClaims.role === 'Admin' ||
            tokenClaims.role === 'ADMIN' ||
            // También verificar si hay un claim personalizado específico
            (tokenClaims as { [key: string]: unknown })['admin'] === true ||
            (tokenClaims as { [key: string]: unknown })['isAdmin'] === true
        
        return Boolean(isAdmin)
    } catch (error) {
        console.error('Error verificando claim de admin:', error)
        return false
    }
}

/**
 * Verifica si el usuario es admin y redirige si no lo es
 * Úsalo en server components o layouts
 */
export async function requireAdmin(): Promise<void> {
    const isAdmin = await checkIsAdmin()
    
    if (!isAdmin) {
        redirect(ROUTES.HOME)
    }
}

