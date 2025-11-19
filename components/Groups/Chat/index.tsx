'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './page.module.css'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState, useRef } from 'react'
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr'
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

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (connection) return
        const conn = new HubConnectionBuilder()
            .withUrl(`${API_URL}/chatHub`)
            .withAutomaticReconnect()
            .build()

        const handleReceiveMessage = (msg: ChatMessage) => {
            setMessages(prev => [...prev, msg])
        }

        conn.on('ReceiveMessage', handleReceiveMessage)

        conn.on('LoadChatHistory', mensajes => {
            setMessages(mensajes)
            // Scroll
            setTimeout(() => scrollToBottom('auto'), 100)
        })

        conn.start()
            .then(() => {
                conn.invoke('JoinGroup', groupId)
            })
            .catch(() => {
                // Error al conectar
            })

        setConnection(conn)

        return () => {
            conn.off('ReceiveMessage', handleReceiveMessage)
            conn.stop()
        }
    }, [groupId])

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
