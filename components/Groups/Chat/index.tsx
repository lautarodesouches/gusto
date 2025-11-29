'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './page.module.css'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState, useRef } from 'react'
import { HubConnectionBuilder, HubConnection, HubConnectionState, LogLevel } from '@microsoft/signalr'
import { API_URL } from '@/constants'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'
import { formatChatDate } from '../../../utils/index'

interface Props {
    admin: string
    groupId: string
}

interface ChatMessage {
    usuario: string
    mensaje: string
    fecha: string
    uid?: string       // UID de Firebase del remitente (opcional)
}

interface UsuarioSeUnioPayload {
    usuarioId: string
    nombre: string
}

interface UsuarioAbandonoPayload {
    usuarioId: string
    nombre: string
    firebaseUid: string
}

export default function GroupsChat({ groupId, admin }: Props) {
    const toast = useToast()
    const { token, loading, user } = useAuth()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const chatContainerRef = useRef<HTMLDivElement>(null)

    const [connection, setConnection] = useState<HubConnection | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState('')
    const connectionRef = useRef<HubConnection | null>(null)

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        // Esperar a que termine el estado de autenticación.
        // Si no hay token (usuario no logueado o cerrando sesión),
        // simplemente no intentamos conectar ni mostramos errores.
        if (loading || !token) {
            return
        }

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

                // Usar accessTokenFactory para enviar el token en la negociación y conexión
                conn = new HubConnectionBuilder()
                    .withUrl(`${API_URL}/chatHub`, {
                        skipNegotiation: false,
                        withCredentials: true, // Enviar cookies también
                        accessTokenFactory: () => {
                            // Retornar el token para que se incluya en la negociación y conexión
                            const currentToken = token || ''
                            return currentToken
                        }
                    })
                    .configureLogging(LogLevel.Error)
                    .withAutomaticReconnect({
                        nextRetryDelayInMilliseconds: (retryContext) => {
                            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000)
                        }
                    })
                    .build()

                connectionRef.current = conn

                // Manejador de errores global para la conexión
                conn.onclose((error) => {
                    if (error && isMounted) {
                        const errorMsg = error.message || String(error)
                        if (!errorMsg.includes('stopped during negotiation') &&
                            !errorMsg.includes('AbortError')) {
                            toast.error('Se perdió la conexión con el chat')
                        }
                    }
                })

                const handleReceiveMessage = (msg: ChatMessage) => {
                    if (!isMounted) return
                    setMessages(prev => [...prev, msg])
                }

                const handleUsuarioSeUnio = (payload: UsuarioSeUnioPayload) => {
                    if (!isMounted) return

                    console.log('[Chat] UsuarioSeUnio recibido:', payload)

                    // Refrescar lista de miembros en tiempo real
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('groups:refresh'))
                    }

                    // Mensaje de sistema local en el chat (no persistido en BD)
                    const systemMessage: ChatMessage = {
                        usuario: 'Sistema',
                        mensaje: `${payload.nombre} se unió al grupo 👋`,
                        fecha: new Date().toISOString(),
                    }

                    setMessages(prev => [...prev, systemMessage])

                    // Toast informativo para que el usuario sepa que alguien se unió
                    // 15000 ms = 15 segundos
                    toast.info(`${payload.nombre} se unió al grupo 👋`, 15000)
                }

                const handleUsuarioAbandono = (payload: UsuarioAbandonoPayload) => {
                    if (!isMounted) return

                    // Si el usuario que abandonó es el usuario actual, no mostrar toast ni mensaje
                    // porque ya sabe que abandonó (él mismo hizo la acción)
                    const esUsuarioActual = user?.uid === payload.firebaseUid

                    // Refrescar lista de miembros en tiempo real (siempre, para que otros usuarios vean el cambio)
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('groups:refresh'))
                    }

                    // Solo mostrar mensaje de sistema y toast si NO es el usuario actual
                    if (!esUsuarioActual) {
                        // Mensaje de sistema local en el chat (no persistido en BD)
                        const systemMessage: ChatMessage = {
                            usuario: 'Sistema',
                            mensaje: `${payload.nombre} abandonó el grupo 👋`,
                            fecha: new Date().toISOString(),
                        }

                        setMessages(prev => [...prev, systemMessage])

                        // Toast informativo para que el usuario sepa que alguien abandonó
                        // 15000 ms = 15 segundos
                        toast.info(`${payload.nombre} abandonó el grupo 👋`, 15000)
                    }
                }

                const handleKickedFromGroup = (payload: { grupoId: string; nombreGrupo: string }) => {
                    if (!isMounted) return

                    // Solo reaccionar si es el grupo actual
                    if (payload.grupoId !== groupId) return

                    // Notificar a toda la vista de grupo mediante un evento global
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('group:kicked', { detail: payload }))
                    }

                    // Detener la conexión de chat para evitar seguir enviando
                    try {
                        conn?.stop().catch(() => { })
                    } catch {
                        // ignorar
                    }
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

                conn.on('ReceiveMessage', handleReceiveMessage)
                conn.on('UsuarioSeUnio', handleUsuarioSeUnio)
                conn.on('UsuarioAbandonoGrupo', handleUsuarioAbandono)
                conn.on('KickedFromGroup', handleKickedFromGroup)
                conn.on('UsuariosConectados', handleUsuariosConectados)

                conn.on('LoadChatHistory', mensajes => {
                    if (!isMounted) return
                    // Mergear mensajes históricos con los mensajes en tiempo real existentes
                    // para evitar perder mensajes de sistema recientes
                    setMessages(prev => {
                        // Crear un mapa de mensajes existentes por clave única (usuario + mensaje + fecha)
                        const existingMap = new Map<string, ChatMessage>()
                        prev.forEach(m => {
                            const key = `${m.usuario}-${m.mensaje}-${m.fecha}`
                            existingMap.set(key, m)
                        })

                        // Agregar mensajes históricos, evitando duplicados
                        mensajes.forEach((m: ChatMessage) => {
                            const key = `${m.usuario}-${m.mensaje}-${m.fecha}`
                            if (!existingMap.has(key)) {
                                existingMap.set(key, m)
                            }
                        })

                        // Convertir de vuelta a array y ordenar por fecha
                        return Array.from(existingMap.values()).sort((a, b) => 
                            new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
                        )
                    })
                    setTimeout(() => scrollToBottom('auto'), 100)
                })

                // Verificar estado antes de iniciar
                if (conn.state === HubConnectionState.Disconnected) {
                    try {
                        await conn.start()
                    } catch (err: unknown) {
                        const error = err as Error
                        const errorMsg = error?.message || String(err)
                        const errorName = (error as { name?: string })?.name || ''

                        // Silenciar errores de aborto y negociación (comunes en desarrollo con Strict Mode)
                        if (errorName === 'AbortError' ||
                            errorMsg.includes('stopped during negotiation') ||
                            errorMsg.includes('The connection was stopped') ||
                            errorMsg.includes('Connection stopped during negotiation')) {
                            // Error silenciado - común en desarrollo, no es un error real
                            if (isMounted) {
                                console.log('[Chat] ℹ️ Conexión interrumpida durante negociación (normal en desarrollo)')
                            }
                            return
                        }

                        // Solo loggear errores reales
                        if (isMounted) {
                            console.error('[Chat] ❌ Error real al conectar:', err)
                            toast.error('Error al conectar con el chat')
                        }
                        return
                    }

                    if (isMounted && conn) {
                        setConnection(conn)
                        try {
                            await conn.invoke('JoinGroup', groupId)
                        } catch {
                            toast.error('Error al unirse al grupo del chat')
                        }
                    }
                }
            } catch (err: unknown) {
                const error = err as Error
                const errorMsg = error?.message || String(err)
                const errorName = (error as { name?: string })?.name || ''

                // Silenciar errores de negociación - NO loggear en consola
                if (errorName === 'AbortError' ||
                    errorMsg.includes('stopped during negotiation') ||
                    errorMsg.includes('The connection was stopped') ||
                    errorMsg.includes('Connection stopped during negotiation')) {
                    // Error silenciado - no hacer nada
                    return
                }

                // Solo loggear errores reales
                if (isMounted) {
                    console.error('[Chat] Error al conectar:', err)
                    toast.error('Error al conectar con el chat')
                }
            }
        }

        // Solo conectar si hay token
        if (token) {
            connect()
        }

        return () => {
            isMounted = false

            const currentConn = connectionRef.current

            if (currentConn) {
                try {
                    if (currentConn.state !== HubConnectionState.Disconnected) {
                        currentConn.stop().catch(() => {
                            // Silenciar errores al detener
                        })
                    }
                } catch {
                    // Ignorar errores
                }

                currentConn.off('ReceiveMessage')
                currentConn.off('UsuarioSeUnio')
                currentConn.off('UsuarioAbandonoGrupo')
                currentConn.off('KickedFromGroup')
                currentConn.off('UsuariosConectados')
                connectionRef.current = null
                setConnection(null)
            }
        }
    }, [groupId, token, loading, toast])

    const handleSend = async () => {
        if (!input.trim() || !connection) return

        try {
            await connection.invoke('SendMessageToGroup', groupId, input)
            setInput('')
        } catch {
            toast.error(`Hubo un error al enviar el mensaje`)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.chat} ref={chatContainerRef}>
                {messages.map((msg, i) => {
                    const { date, time } = formatChatDate(msg.fecha)

                    // Determinar si el mensaje es del usuario actual usando el UID de Firebase.
                    // El backend envía uid = firebaseUid en SendMessageToGroup.
                    const myUid = user?.uid
                    const isMine = !!myUid && !!msg.uid && msg.uid === myUid

                    const displayName = isMine ? 'Yo' : msg.usuario

                    return (
                        <article
                            key={i}
                            className={`${styles.chat__message} ${
                                isMine ? styles['chat__message--mine'] : ''
                            }`}
                        >
                            <div className={styles.chat__header}>
                                <p className={styles.chat__sender}>
                                    {displayName}
                                </p>
                            </div>
                            <p className={styles.chat__text}>{msg.mensaje}</p>
                            <div className={styles.chat__footer}>
                                <span className={styles.chat__date}>{date}</span>
                                <span className={styles.chat__separator}>•</span>
                                <span className={styles.chat__time}>{time}</span>
                            </div>
                        </article>
                    )
                })}
                {/* Scroll item */}
                <div ref={messagesEndRef} />
            </div>
            <fieldset className={styles.fieldset}>
                <input
                    className={styles.fieldset__input}
                    type="text"
                    name="message"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Escribe un mensaje"
                    onKeyDown={handleKeyDown}
                />
                <button
                    className={styles.fieldset__button}
                    onClick={handleSend}
                    type="button"
                    aria-label="Enviar mensaje"
                >
                    <FontAwesomeIcon
                        className={styles.fieldset__icon}
                        icon={faPaperPlane}
                    />
                </button>
            </fieldset>
        </div>
    )
}
