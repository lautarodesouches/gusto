'use client'

import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr'
import { useEffect, useRef, useState, useCallback } from 'react'

interface UseSignalRConnectionOptions {
    url: string
    token?: string
    withCredentials?: boolean
    onConnected?: () => void
    onDisconnected?: () => void
    onReconnecting?: () => void
    onReconnected?: () => void
    onError?: (error: Error) => void
}

export function useSignalRConnection({
    url,
    token,
    withCredentials = true,
    onConnected,
    onDisconnected,
    onReconnecting,
    onReconnected,
    onError,
}: UseSignalRConnectionOptions) {
    const connectionRef = useRef<HubConnection | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const startAttemptedRef = useRef(false)

    // Crear conexión una sola vez (fuera del useEffect)
    if (!connectionRef.current) {
        const connectionOptions: Record<string, unknown> = {
            withCredentials,
        }

        // Solo agregar accessTokenFactory si hay token
        if (token) {
            connectionOptions.accessTokenFactory = () => token
        }

        connectionRef.current = new HubConnectionBuilder()
            .withUrl(url, connectionOptions)
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    // Reintentar después de 0s, 2s, 10s, 30s, luego cada 30s
                    if (retryContext.previousRetryCount === 0) return 0
                    if (retryContext.previousRetryCount === 1) return 2000
                    if (retryContext.previousRetryCount === 2) return 10000
                    return 30000
                },
            })
            .build()

        // Configurar event handlers una sola vez
        connectionRef.current.onreconnecting(() => {
            console.log('[SignalR] Reconnecting...', url)
            setIsConnected(false)
            if (onReconnecting) onReconnecting()
        })

        connectionRef.current.onreconnected(() => {
            console.log('[SignalR] Reconnected', url)
            setIsConnected(true)
            setError(null)
            if (onReconnected) onReconnected()
        })

        connectionRef.current.onclose((err) => {
            console.log('[SignalR] Connection closed', url, err)
            setIsConnected(false)
            if (err) {
                const errorMessage = err.message || 'Conexión perdida'
                // ❌ NO establecer error en estado para errores de negociación/conexión
                // Estos son temporales y se resuelven automáticamente con reconexión
                // Solo loggear en consola
                if (!errorMessage.toLowerCase().includes('negotiation') && 
                    !errorMessage.toLowerCase().includes('connection was stopped')) {
                    // Solo establecer error para errores críticos
                    setError(errorMessage)
                    if (onError) onError(new Error(errorMessage))
                } else {
                    // Errores de negociación: solo loggear, NO mostrar en UI
                    console.log('[SignalR] Error de negociación (ignorado en UI):', errorMessage)
                }
            }
            if (onDisconnected) onDisconnected()
        })
    }

    const startConnection = useCallback(async () => {
        const conn = connectionRef.current
        if (!conn) return

        // Verificar estado antes de intentar conectar
        if (
            conn.state === HubConnectionState.Connected ||
            conn.state === HubConnectionState.Connecting ||
            conn.state === HubConnectionState.Reconnecting
        ) {
            console.log('[SignalR] Ya conectado o conectando, estado:', conn.state, url)
            return
        }

        // Evitar múltiples intentos simultáneos
        if (startAttemptedRef.current) {
            console.log('[SignalR] Start ya intentado, esperando...', url)
            return
        }

        startAttemptedRef.current = true

        try {
            await conn.start()
            console.log('[SignalR] Connected:', url)
            setIsConnected(true)
            setError(null)
            if (onConnected) onConnected()
        } catch (err) {
            console.error('[SignalR] Error connecting:', err, url)
            const errorMessage = err instanceof Error ? err.message : String(err)
            
            // ❌ NO establecer error en estado para errores de negociación/conexión
            // Estos son temporales y se resuelven automáticamente con reconexión
            if (!errorMessage.toLowerCase().includes('negotiation') && 
                !errorMessage.toLowerCase().includes('connection was stopped') &&
                !errorMessage.toLowerCase().includes('failed to start')) {
                // Solo establecer error para errores críticos (ej: 401 Unauthorized)
                setError(errorMessage)
                if (onError) onError(err instanceof Error ? err : new Error(errorMessage))
            } else {
                // Errores de negociación/conexión: solo loggear, NO mostrar en UI
                console.log('[SignalR] Error de conexión (ignorado en UI, reintentando):', errorMessage)
            }
            
            setIsConnected(false)
            
            // Retry después de 2 segundos
            setTimeout(() => {
                startAttemptedRef.current = false
                startConnection()
            }, 2000)
        }
    }, [url, onConnected, onError])

    useEffect(() => {
        if (!url) return

        startConnection()

        return () => {
            const conn = connectionRef.current
            if (conn) {
                conn.stop()
                    .then(() => {
                        console.log('[SignalR] Disconnected:', url)
                    })
                    .catch((err) => {
                        console.error('[SignalR] Error disconnecting:', err, url)
                    })
                connectionRef.current = null
                setIsConnected(false)
                startAttemptedRef.current = false
            }
        }
    }, [url, startConnection])

    return {
        connection: connectionRef.current,
        isConnected,
        error,
    }
}

