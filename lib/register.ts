// lib/auth/register.ts

import { API_URL } from '@/constants'

interface RegisterPayload {
    nombre: string
    apellido: string
    email: string
    fotoPerfilUrl?: string
    idUsuario?: number
}

export const registerUser = async (payload: RegisterPayload) => {
    try {
        const res = await fetch(`${API_URL}/Usuario/registrar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.message || 'Error en registro')
        }

        return await res.json()
    } catch (error) {
        console.error('Error en la petición:', error)
        throw error
    }
}
