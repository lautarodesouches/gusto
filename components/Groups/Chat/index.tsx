/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './page.module.css'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState, useRef } from 'react'
import { HubConnectionBuilder, HubConnection, HubConnectionState } from '@microsoft/signalr'
import { API_URL } from '@/constants'
import { useToast } from '@/context/ToastContext'
import { formatChatDate } from '../../../utils/index'

interface Props {
    admin: string
    groupId: string
}

interface ChatMessage {
    usuario: string
    mensaje: string
    fecha: string
}

export default function GroupsChat({ groupId, admin }: Props) {
    const toast = useToast()
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
        let isMounted = true
        let conn: HubConnection | null = null
        let startPromise: Promise<void> | null = null
        const originalConsoleError = console.error
        let errorInterceptorActive = true
        
        // Interceptar console.error temporalmente para silenciar errores de negociación
        console.error = (...args: any[]) => {
            if (errorInterceptorActive && args.length > 0) {
                const firstArg = args[0]
                const errorMsg = firstArg?.message || firstArg?.toString() || String(firstArg || '')
                
                // Silenciar errores específicos de SignalR durante negociación
                if (errorMsg.includes('stopped during negotiation') || 
                    errorMsg.includes('The connection was stopped') ||
                    errorMsg.includes('Failed to start the connection')) {
                    // Verificar si es realmente un error de aborto/negociación
                    const fullMsg = args.map(a => String(a)).join(' ')
                    if (fullMsg.includes('negotiation') || fullMsg.includes('AbortError')) {
                        return // Silenciar este error
                    }
                }
            }
            originalConsoleError.apply(console, args)
        }

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
                        // Configurar opciones para manejar mejor los errores
                        skipNegotiation: false,
                    })
                    .withAutomaticReconnect({
                        nextRetryDelayInMilliseconds: (retryContext) => {
                            // Evitar reconexiones rápidas que puedan causar errores
                            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000)
                        }
                    })
                    .build()

                connectionRef.current = conn

                // Manejador de errores global para la conexión
                conn.onclose((error) => {
                    if (error && isMounted) {
                        // Solo loguear si no es un cierre normal
                        if (error !== undefined) {
                            const errorMsg = error.message || String(error)
                            if (!errorMsg.includes('stopped during negotiation') && 
                                !errorMsg.includes('AbortError')) {
                                console.log('🔴 Conexión cerrada:', errorMsg)
                            }
                        }
                    }
                })

                const handleReceiveMessage = (msg: ChatMessage) => {
                    if (!isMounted) return
                    console.log('📩 Mensaje recibido:', msg)
                    setMessages(prev => [...prev, msg])
                }

                conn.on('ReceiveMessage', handleReceiveMessage)

                conn.on('LoadChatHistory', mensajes => {
                    if (!isMounted) return
                    setMessages(mensajes)
                    // Scroll
                    setTimeout(() => scrollToBottom('auto'), 100)
                })

                // Verificar estado antes de iniciar
                if (conn.state === HubConnectionState.Disconnected) {
                    startPromise = conn.start()
                    
                    // Interceptar el error antes de que SignalR lo loguee
                    startPromise = startPromise.catch((err: any) => {
                        const errorMsg = err?.message || String(err)
                        const errorName = err?.name || ''
                        
                        // Silenciar errores de aborto y negociación
                        if (errorName === 'AbortError' || 
                            errorMsg.includes('stopped during negotiation') ||
                            errorMsg.includes('The connection was stopped')) {
                            // No hacer nada - estos errores son normales
                            return Promise.resolve()
                        }
                        
                        // Re-lanzar otros errores
                        throw err
                    })
                    
                    await startPromise
                    
                    // Si llegamos aquí sin error, la conexión está conectada
                    // Verificamos que el componente siga montado y la conexión exista
                    if (isMounted && conn) {
                        console.log('🟢 Conectado a SignalR')
                        setConnection(conn)
                        try {
                            await conn.invoke('JoinGroup', groupId)
                        } catch (invokeErr) {
                            // Si falla el invoke, puede ser que la conexión se haya perdido
                            // pero no es crítico, el usuario puede seguir usando el chat
                            console.warn('⚠️ Error al unirse al grupo:', invokeErr)
                        }
                    }
                }
            } catch (err: any) {
                // Ignorar errores de aborto durante la negociación
                const errorMsg = err?.message || String(err)
                const errorName = err?.name || ''
                
                if (errorName === 'AbortError' || 
                    errorMsg.includes('stopped during negotiation') ||
                    errorMsg.includes('The connection was stopped')) {
                    // Silenciar estos errores - son normales cuando el componente se desmonta
                    return
                }
                
                if (isMounted) {
                    console.error('Error al conectar:', err)
                }
            }
        }

        connect()

        return () => {
            isMounted = false
            errorInterceptorActive = false
            
            // Restaurar console.error original
            console.error = originalConsoleError
            
            // Detener inmediatamente cualquier conexión en progreso
            const currentConn = connectionRef.current
            
            if (currentConn) {
                // Detener la conexión inmediatamente sin esperar
                // Esto previene que SignalR loguee errores de negociación
                try {
                    if (currentConn.state !== HubConnectionState.Disconnected) {
                        currentConn.stop().catch(() => {
                            // Silenciar todos los errores al detener
                        })
                    }
                } catch {
                    // Ignorar errores
                }
                
                currentConn.off('ReceiveMessage')
                connectionRef.current = null
                setConnection(null)
            }
            
            // También cancelar la promesa de inicio si está en progreso
            if (startPromise && conn) {
                try {
                    if (conn.state !== HubConnectionState.Disconnected) {
                        conn.stop().catch(() => {
                            // Silenciar errores
                        })
                    }
                } catch {
                    // Ignorar errores
                }
            }
        }
    }, [groupId])

    const handleSend = async () => {
        if (!input.trim() || !connection) return

        try {
            await connection.invoke('SendMessageToGroup', groupId, input)
            setInput('')
        } catch (err) {
            toast.error(`Hubo un error al enviar el mensaje`)
            console.error(err)
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
                    console.log({ msg })
                    console.log({ admin })

                    return (
                        <article
                            key={i}
                            className={`${styles.chat__message} ${
                                admin
                                    .toLowerCase()
                                    .includes(
                                        msg.usuario.toLowerCase().split(' ')[0]
                                    )
                                    ? styles['chat__message--mine']
                                    : ''
                            }`}
                        >
                            <div className={styles.chat__top}>
                                <p className={styles.chat__sender}>
                                    {msg.usuario}
                                </p>
                                <p className={styles.chat__time}>
                                    {formatChatDate(msg.fecha)}
                                </p>
                            </div>
                            <p className={styles.chat__text}>{msg.mensaje}</p>
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
