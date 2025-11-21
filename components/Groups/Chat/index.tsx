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
                    })
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

                conn.on('ReceiveMessage', handleReceiveMessage)

                conn.on('LoadChatHistory', mensajes => {
                    if (!isMounted) return
                    setMessages(mensajes)
                    setTimeout(() => scrollToBottom('auto'), 100)
                })

                // Verificar estado antes de iniciar
                if (conn.state === HubConnectionState.Disconnected) {
                    startPromise = conn.start()
                    
                    startPromise = startPromise.catch((err: unknown) => {
                        const error = err as Error
                        const errorMsg = error?.message || String(err)
                        const errorName = (error as { name?: string })?.name || ''
                        
                        // Silenciar errores de aborto y negociación
                        if (errorName === 'AbortError' || 
                            errorMsg.includes('stopped during negotiation') ||
                            errorMsg.includes('The connection was stopped')) {
                            return Promise.resolve()
                        }
                        
                        throw err
                    })
                    
                    await startPromise
                    
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
                
                if (errorName === 'AbortError' || 
                    errorMsg.includes('stopped during negotiation') ||
                    errorMsg.includes('The connection was stopped')) {
                    return
                }
                
                if (isMounted) {
                    toast.error('Error al conectar con el chat')
                }
            }
        }

        connect()

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
                connectionRef.current = null
                setConnection(null)
            }
        }
    }, [groupId, toast])

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
                            <div className={styles.chat__header}>
                                <p className={styles.chat__sender}>
                                    {msg.usuario}
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
