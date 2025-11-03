'use client'
import { useEffect, useState } from 'react'
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr'

interface ChatMessage {
  usuario: string
  mensaje: string
  fecha: string
}

export default function ChatGrupo({ grupoId }: { grupoId: string }) {
  const [connection, setConnection] = useState<HubConnection | null>(null)
  const [mensajes, setMensajes] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')


  useEffect(() => {
    if (connection) return; 
    const conn = new HubConnectionBuilder()
      .withUrl('http://localhost:5174/chatHub')
      .withAutomaticReconnect()
      .build()

      
    const handleReceiveMessage = (msg: ChatMessage) => {
      console.log('📩 Mensaje recibido:', msg)
      setMensajes(prev => [...prev, msg])
    }

    conn.on('ReceiveMessage', handleReceiveMessage)

    conn.on('LoadChatHistory', (mensajes) => {
     setMensajes(mensajes);
});

    conn
      .start()
      .then(() => {
        console.log('🟢 Conectado a SignalR')
        conn.invoke('JoinGroup', grupoId)
      })
      .catch(err => console.error('Error al conectar:', err))

    setConnection(conn)

    
    return () => {
      console.log('🧹 Cerrando conexión SignalR...')
      conn.off('ReceiveMessage', handleReceiveMessage)
      conn.stop()
    }
  }, [grupoId])

  const handleSend = async () => {
    if (!input.trim() || !connection) return

    try {
      await connection.invoke('SendMessageToGroup', grupoId, input)
      setInput('')
    } catch (err) {
      console.error('Error enviando mensaje:', err)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>💬 Chat del Grupo</h2>

      <div
        style={{
          border: '1px solid #ccc',
          borderRadius: 8,
          padding: 10,
          height: 300,
          overflowY: 'auto',
          marginBottom: 10,
        }}
      >
        {mensajes.map((m, i) => (
          <div key={i}>
            <strong>{m.usuario}</strong>: {m.mensaje}
            <div style={{ fontSize: 12, color: '#888' }}>
              {new Date(m.fecha).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Escribí un mensaje..."
        style={{ width: '80%', padding: 5 }}
      />
      <button onClick={handleSend} style={{ marginLeft: 10 }}>
        Enviar
      </button>
    </div>
  )
}
