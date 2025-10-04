// lib/auth/register.ts

import { API_URL } from '@/constants'

interface RegisterPayload {
    nombre: string
    apellido: string
    email: string
    fotoPerfilUrl?: string
    idUsuario?: number
    token: string
}

export const registerUser = async (payload: RegisterPayload) => {
    try {
        const res = await fetch(`${API_URL}/Usuario/registrar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${payload.token}`,
            },
            body: JSON.stringify(payload),
        })

        // Safely read body as text first to avoid "Unexpected end of JSON input"
        const text = await res.text()
        const hasBody = text && text.trim().length > 0
        let parsed: any = null
        if (hasBody) {
            try {
                parsed = JSON.parse(text)
            } catch (e) {
                // If body isn't JSON, fallback to raw text
                parsed = text
            }
        }

        if (!res.ok) {
            // Prefer a message from parsed JSON, otherwise use text or status
            const message = parsed && typeof parsed === 'object' && parsed.message
                ? parsed.message
                : (hasBody ? String(parsed) : `Error en registro (status ${res.status})`)
            const error = new Error(message)
            // attach some debugging info
            ;(error as any).status = res.status
            ;(error as any).body = parsed
            throw error
        }

        // Return parsed JSON if available, otherwise return raw text or null
        return parsed ?? null
    } catch (error) {
        console.error('Error en la petición registerUser:', error)
        throw error
    }
}
