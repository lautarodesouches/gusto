'use client'

import { useRef, useCallback } from 'react'

/**
 * Hook para prevenir llamadas duplicadas a la API
 * Útil para evitar múltiples llamadas cuando React ejecuta efectos dos veces en desarrollo
 */
export function useApiCall() {
    const pendingCallsRef = useRef<Set<string>>(new Set())

    const makeApiCall = useCallback(async <T>(
        key: string,
        apiCall: () => Promise<T>,
        options?: {
            timeout?: number // Tiempo en ms para considerar que la llamada ya no está pendiente
        }
    ): Promise<T | null> => {
        // Si ya hay una llamada pendiente con esta key, no hacer nada
        if (pendingCallsRef.current.has(key)) {
            console.log(`[useApiCall] Llamada duplicada prevenida para: ${key}`)
            return null
        }

        // Marcar la llamada como pendiente
        pendingCallsRef.current.add(key)

        try {
            const result = await apiCall()
            return result
        } catch (error) {
            throw error
        } finally {
            // Remover la llamada de pendientes después de un pequeño delay
            // para evitar llamadas muy rápidas consecutivas
            setTimeout(() => {
                pendingCallsRef.current.delete(key)
            }, options?.timeout || 100)
        }
    }, [])

    const clearPendingCall = useCallback((key: string) => {
        pendingCallsRef.current.delete(key)
    }, [])

    const isPending = useCallback((key: string) => {
        return pendingCallsRef.current.has(key)
    }, [])

    return {
        makeApiCall,
        clearPendingCall,
        isPending
    }
}
