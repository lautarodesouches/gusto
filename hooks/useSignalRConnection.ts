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
    const [connection, setConnection] = useState<HubConnection | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const startAttemptedRef = useRef(false)

    // Efecto para crear y gestionar la conexión
    useEffect(() => {
        if (!url) return

        const connectionOptions: Record<string, unknown> = {
            withCredentials,
        }

        if (token) {
            connectionOptions.accessTokenFactory = () => token
        }

        // Crear instancia
        const newConnection = new HubConnectionBuilder()
            .withUrl(url, connectionOptions)
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    if (retryContext.previousRetryCount === 0) return 0
                    if (retryContext.previousRetryCount === 1) return 2000
                    if (retryContext.previousRetryCount === 2) return 10000
                    return 30000
                },
            })
            .build()

        setConnection(newConnection)

        // Handlers
        newConnection.onreconnecting(() => {
            console.log('[SignalR] Reconnecting...', url)
            setIsConnected(false)
            if (onReconnecting) onReconnecting()
        })

        newConnection.onreconnected(() => {
            console.log('[SignalR] Reconnected', url)
            setIsConnected(true)
            setError(null)
            if (onReconnected) onReconnected()
        })

        newConnection.onclose((err) => {
            console.log('[SignalR] Connection closed', url, err)
            setIsConnected(false)
            if (err) {
                const errorMessage = err.message || 'Conexión perdida'
                if (!errorMessage.toLowerCase().includes('negotiation') &&
                    !errorMessage.toLowerCase().includes('connection was stopped')) {
                    setError(errorMessage)
                    if (onError) onError(new Error(errorMessage))
                } else {
                    console.log('[SignalR] Error de negociación (ignorado en UI):', errorMessage)
                }
            }
            if (onDisconnected) onDisconnected()
        })

        // Función de inicio
        const startConnection = async () => {
            if (startAttemptedRef.current) return

            // Verificar estado antes de iniciar
            if (newConnection.state !== HubConnectionState.Disconnected) return

            startAttemptedRef.current = true

            try {
                await newConnection.start()
                console.log('[SignalR] Connected:', url)
                setIsConnected(true)
                setError(null)
                if (onConnected) onConnected()
            } catch (err) {
                console.error('[SignalR] Error connecting:', err, url)
                const errorMessage = err instanceof Error ? err.message : String(err)

                if (!errorMessage.toLowerCase().includes('negotiation') &&
                    !errorMessage.toLowerCase().includes('connection was stopped') &&
                    !errorMessage.toLowerCase().includes('failed to start')) {
                    setError(errorMessage)
                    if (onError) onError(err instanceof Error ? err : new Error(errorMessage))
                } else {
                    console.log('[SignalR] Error de conexión (ignorado en UI, reintentando):', errorMessage)
                }

                setIsConnected(false)

                // Retry simple si falla el inicio inicial
                setTimeout(() => {
                    startAttemptedRef.current = false
                    if (newConnection.state === HubConnectionState.Disconnected) {
                        startConnection()
                    }
                }, 2000)
            }
        }

        startConnection()

        // Cleanup
        return () => {
            startAttemptedRef.current = false
            newConnection.stop()
                .then(() => console.log('[SignalR] Disconnected:', url))
                .catch(err => console.error('[SignalR] Error disconnecting:', err, url))
        }
    }, [url, token, withCredentials]) // Re-crear si cambia URL o token

    return {
        connection,
        isConnected,
        error,
    }
}

