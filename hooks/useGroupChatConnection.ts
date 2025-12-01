'use client'

import { useEffect, useRef } from 'react'
import { HubConnectionBuilder, HubConnection, HubConnectionState, LogLevel } from '@microsoft/signalr'
import { API_URL } from '@/constants'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

interface UseGroupChatConnectionOptions {
    groupId: string
    isAdmin?: boolean
    onMessage?: (msg: ChatMessage) => void
    onUsuarioSeUnio?: (payload: { usuarioId: string; nombre: string }) => void
    onUsuarioAbandono?: (payload: { firebaseUid: string; nombre: string }) => void
    onUsuarioExpulsado?: (payload: { firebaseUid: string; nombre: string }) => void
    onKickedFromGroup?: (payload: { grupoId: string; nombreGrupo: string }) => void
}

interface ChatMessage {
    usuario: string
    mensaje: string
    fecha: string
}

export function useGroupChatConnection({
    groupId,
    isAdmin = false,
    onMessage,
    onUsuarioSeUnio,
    onUsuarioAbandono,
    onUsuarioExpulsado,
    onKickedFromGroup,
}: UseGroupChatConnectionOptions) {
    const { token, loading, user } = useAuth()
    const toast = useToast()
    const connectionRef = useRef<HubConnection | null>(null)
    const isAdminRef = useRef(isAdmin)
    const handlersRef = useRef({
        onMessage,
        onUsuarioSeUnio,
        onUsuarioAbandono,
        onUsuarioExpulsado,
        onKickedFromGroup,
    })

    // Mantener handlers actualizados
    useEffect(() => {
        handlersRef.current = {
            onMessage,
            onUsuarioSeUnio,
            onUsuarioAbandono,
            onUsuarioExpulsado,
            onKickedFromGroup,
        }
    }, [onMessage, onUsuarioSeUnio, onUsuarioAbandono, onUsuarioExpulsado, onKickedFromGroup])

    // Mantener isAdmin actualizado
    useEffect(() => {
        isAdminRef.current = isAdmin
    }, [isAdmin])

    useEffect(() => {
        if (loading || !token || !groupId) return

        let isMounted = true
        let conn: HubConnection | null = null

        const connect = async () => {
            try {
                // Detener conexión anterior si existe
                if (connectionRef.current) {
                    try {
                        await connectionRef.current.stop()
                    } catch {
                        // Ignorar errores al detener conexión anterior
                    }
                    connectionRef.current = null
                }

                conn = new HubConnectionBuilder()
                    .withUrl(`${API_URL}/chatHub`, {
                        skipNegotiation: false,
                        withCredentials: true,
                        accessTokenFactory: () => token || '',
                    })
                    .configureLogging(LogLevel.Error)
                    .withAutomaticReconnect({
                        nextRetryDelayInMilliseconds: (retryContext) => {
                            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000)
                        },
                    })
                    .build()

                connectionRef.current = conn

                // Manejador de errores global
                conn.onclose((error) => {
                    if (error && isMounted) {
                        const errorMsg = error.message || String(error)
                        if (
                            !errorMsg.includes('stopped during negotiation') &&
                            !errorMsg.includes('AbortError')
                        ) {
                            // Solo mostrar error si no es un error de negociación
                            console.error('[Chat] Conexión cerrada:', errorMsg)
                        }
                    }
                })

                // Handlers de eventos
                const handleReceiveMessage = (msg: ChatMessage) => {
                    if (!isMounted) return
                    handlersRef.current.onMessage?.(msg)
                }

                const handleUsuarioSeUnio = (payload: { usuarioId: string; nombre: string }) => {
                    if (!isMounted) return

                    // Refrescar lista de miembros
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('groups:refresh'))
                    }

                    // Notificar
                    toast.info(`${payload.nombre} se unió al grupo 👋`, 15000)
                }

                const handleUsuarioAbandono = (payload: { firebaseUid: string; nombre: string }) => {
                    if (!isMounted) return
                    const esUsuarioActual = user?.uid === payload.firebaseUid

                    // Refrescar lista de miembros
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('groups:refresh'))
                    }

                    if (!esUsuarioActual) {
                        toast.info(`${payload.nombre} abandonó el grupo 👋`, 15000)
                    }
                }

                const handleKickedFromGroup = (payload: { grupoId: string; nombreGrupo: string }) => {
                    if (!isMounted) return
                    if (payload.grupoId !== groupId) return

                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('group:kicked', { detail: payload }))
                    }

                    try {
                        conn?.stop().catch(() => {})
                    } catch {
                        // ignorar
                    }
                }

                const handleUsuarioExpulsado = (payload: { firebaseUid: string; nombre: string }) => {
                    if (!isMounted) return

                    if (isAdminRef.current) {
                        // Solo refrescar si es admin
                        if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('groups:refresh'))
                        }
                        return
                    }

                    // Refrescar lista de miembros
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('groups:refresh'))
                    }

                    toast.info(`${payload.nombre} fue expulsado del grupo 🚫`, 15000)
                }

                const handleUsuariosConectados = (conectados: string[]) => {
                    if (!isMounted) return

                    // Notificar a toda la app mediante un evento global
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(
                            new CustomEvent('usuarios:conectados', { detail: conectados })
                        )
                    }
                }

                // Suscribirse a eventos
                conn.on('ReceiveMessage', handleReceiveMessage)
                conn.on('UsuarioSeUnio', handleUsuarioSeUnio)
                conn.on('UsuarioAbandonoGrupo', handleUsuarioAbandono)
                conn.on('UsuarioExpulsado', handleUsuarioExpulsado)
                conn.on('KickedFromGroup', handleKickedFromGroup)
                conn.on('UsuariosConectados', handleUsuariosConectados)

                // Cargar historial de chat
                conn.on('LoadChatHistory', (mensajes: ChatMessage[]) => {
                    if (!isMounted) return
                    // Emitir evento global para que el componente Chat lo escuche
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(
                            new CustomEvent('chat:historial', { detail: mensajes })
                        )
                    }
                })

                // Iniciar conexión
                await conn.start()

                // Solicitar historial de chat
                if (conn.state === HubConnectionState.Connected) {
                    await conn.invoke('JoinGroup', groupId)
                }
            } catch (err) {
                console.error('[Chat] Error al conectar:', err)
            }
        }

        connect()

        return () => {
            isMounted = false
            if (connectionRef.current) {
                connectionRef.current
                    .stop()
                    .then(() => {
                        console.log('[Chat] Desconectado')
                    })
                    .catch((err) => {
                        console.error('[Chat] Error al desconectar:', err)
                    })
                connectionRef.current = null
            }
        }
    }, [groupId, token, loading, user?.uid, toast])

    // Función para enviar mensaje
    const sendMessage = async (message: string) => {
        if (!connectionRef.current || !message.trim()) return

        try {
            await connectionRef.current.invoke('SendMessageToGroup', groupId, message)
        } catch (err) {
            console.error('[Chat] Error al enviar mensaje:', err)
            toast.error('Hubo un error al enviar el mensaje')
        }
    }

    return {
        connection: connectionRef.current,
        sendMessage,
    }
}

