"use client"
import React, { useEffect, useState, useRef } from 'react'
import styles from './chat.module.css'
import { useAuth } from '@/context/AuthContext'

interface Props {
    grupoId: string
    grupoNombre?: string
    onClose: () => void
    docked?: boolean
}

export default function GroupChat({ grupoId, grupoNombre, onClose, docked = false }: Props) {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5174'
    const { token, user } = useAuth()
    const [messages, setMessages] = useState<any[]>([])
    const [input, setInput] = useState('')
    const [status, setStatus] = useState<string | null>(null)
    const [members, setMembers] = useState<any[] | null>(null)
    const [showMembers, setShowMembers] = useState(false)
    const [groupDetails, setGroupDetails] = useState<any>(null)
    const [removingMember, setRemovingMember] = useState<string | null>(null)
    const mounted = useRef(true)
    const messagesRef = useRef<HTMLDivElement | null>(null)

    const authHeaders = () => {
        const h: Record<string, string> = { 'Content-Type': 'application/json' }
        if (token) h['Authorization'] = `Bearer ${token}`
        return h
    }

    async function loadMessages() {
        try {
            console.log('[GroupChat] Loading messages for grupo:', grupoId)
            const res = await fetch(`${API_BASE}/Grupo/${encodeURIComponent(grupoId)}/chat`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
            if (!res.ok) {
                const txt = await res.text()
                setStatus('Error cargando chat: ' + txt)
                return
            }
            const data = await res.json()
            console.log('[GroupChat] Received messages:', data)
            if (Array.isArray(data) && data.length > 0) {
                console.log('[GroupChat] First message date info:', {
                    fechaEnvio: data[0].fechaEnvio,
                    FechaEnvio: data[0].FechaEnvio,
                    parsed: new Date(data[0].fechaEnvio ?? data[0].FechaEnvio),
                    utc: new Date(data[0].fechaEnvio ?? data[0].FechaEnvio).toISOString(),
                    buenosAires: new Date(data[0].fechaEnvio ?? data[0].FechaEnvio).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })
                })
            }
            setMessages(Array.isArray(data) ? data : [])
        } catch (e) {
            console.error(e)
            setStatus('Error cargando chat: ' + String(e))
        }
    }

    async function loadGroupDetails() {
        try {
            console.log('[GroupChat] Loading group details for:', grupoId)
            const res = await fetch(`${API_BASE}/Grupo/${encodeURIComponent(grupoId)}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
            if (!res.ok) {
                console.error('[GroupChat] Failed to load group details:', res.status, res.statusText)
                return
            }
            const data = await res.json()
            console.log('[GroupChat] Received group data:', data)
            setGroupDetails(data)
            
            console.log('[GroupChat] Full group details:', data)
            // handle different casings: miembros / Miembros / members
            const membersCandidate = data?.miembros ?? data?.Miembros ?? data?.members ?? data?.Members
            if (Array.isArray(membersCandidate)) {
                console.log('[GroupChat] Members from API:', membersCandidate.map(m => ({ 
                    id: m.usuarioId ?? m.UsuarioId, 
                    name: m.usuarioNombre ?? m.UsuarioNombre,
                    activo: m.activo
                })))
                console.log('[GroupChat] Updating members state from', members?.length, 'to', membersCandidate.length, 'members')
                
                // Force complete state refresh
                setMembers([])
                setTimeout(() => {
                    setMembers([...membersCandidate])
                }, 10)
            } else {
                console.warn('[GroupChat] loadGroupDetails: no members array in response', data)
                setStatus('No se encontró lista de miembros en la respuesta del servidor')
            }
        } catch (e) {
            console.error('[GroupChat] loadGroupDetails error', e)
            setStatus('Error cargando detalles del grupo: ' + String(e))
        }
    }

    async function removeMember(usuarioId: string) {
        setRemovingMember(usuarioId)
        setStatus('Removiendo miembro...')
        console.log('[GroupChat] Attempting to remove member:', usuarioId)
        
        try {
            if (!confirm('¿Remover este miembro del grupo?')) {
                setRemovingMember(null)
                setStatus(null)
                return
            }
            
            const url = `${API_BASE}/Grupo/${encodeURIComponent(grupoId)}/miembros/${encodeURIComponent(usuarioId)}`
            console.log('[GroupChat] DELETE request to:', url)
            
            const res = await fetch(url, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined })
            
            if (!res.ok) {
                const txt = await res.text()
                console.error('[GroupChat] Remove member failed:', res.status, txt)
                
                if (res.status === 400 && txt.includes('no es miembro activo')) {
                    setStatus('El usuario ya fue removido del grupo')
                    // Force reload to sync the UI
                    await loadGroupDetails()
                } else {
                    setStatus('Error removiendo miembro: ' + txt)
                }
                setRemovingMember(null)
                return
            }
            
            console.log('[GroupChat] Member removed successfully')
            setStatus('Miembro removido exitosamente')
            
            // Optimistically remove from local state first
            setMembers(prevMembers => {
                const newMembers = prevMembers?.filter(m => 
                    (m.usuarioId ?? m.UsuarioId) !== usuarioId
                ) ?? []
                console.log('[GroupChat] Optimistic update: removed member from local state, new count:', newMembers.length)
                return newMembers
            })
            
            console.log('[GroupChat] Member removed, reloading group details...')
            // Reload both messages and group details to refresh members list
            await loadGroupDetails()
            await loadMessages()
            console.log('[GroupChat] Reload completed, current members state:', members)
            setRemovingMember(null)
            // Clear status after a short delay
            setTimeout(() => setStatus(null), 2000)
        } catch (e) {
            console.error('[GroupChat] Exception removing member:', e)
            setStatus('Error removiendo miembro: ' + String(e))
            setRemovingMember(null)
        }
    }

    async function sendMessage() {
        if (!input || input.trim() === '') return
        console.log('[GroupChat] Sending message:', input)
        setStatus('Enviando...')
        try {
            const res = await fetch(`${API_BASE}/Grupo/${encodeURIComponent(grupoId)}/chat`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ mensaje: input })
            })
            if (!res.ok) {
                const txt = await res.text()
                setStatus('Error enviando: ' + txt)
                return
            }
            setInput('')
            setStatus(null)
            console.log('[GroupChat] Message sent, reloading messages...')
            await loadMessages()
            // focus back to input
            const el = document.querySelector(`#chat-input-${grupoId}`) as HTMLInputElement | null
            if (el) el.focus()
        } catch (e) {
            console.error(e)
            setStatus('Error enviando: ' + String(e))
        }
    }

    useEffect(() => {
        mounted.current = true
        let canceled = false
        loadMessages()
        loadGroupDetails()
        const interval = setInterval(() => { if (!canceled) loadMessages() }, 3000)
        return () => { canceled = true; clearInterval(interval); mounted.current = false }
    }, [grupoId, token])

    useEffect(() => {
        // autoscroll when messages update
        if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight
        }
    }, [messages])

    return (
        // if docked, render a compact panel without overlay
        docked ? (
            <div className={styles.docked}>
                <div className={styles.header}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong>{grupoNombre ?? 'Grupo'}</strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            
                            {docked && members && members.length > 0 && (
                                <button className={styles.button} onClick={() => setShowMembers(!showMembers)}>{showMembers ? 'Ocultar' : 'Ver miembros'}</button>
                            )}
                        </div>
                        {showMembers && members && (
                            <div key={`members-docked-${members.length}-${Date.now()}`} style={{ marginTop: 6, maxHeight: 120, overflow: 'auto' }}>
                                {members.map((m: any, idx: number) => {
                                    const memberId = m.usuarioId ?? m.UsuarioId ?? m.id ?? m.Id
                                    const memberName = m.usuarioNombre ?? m.UsuarioNombre ?? m.nombre ?? m.displayName ?? m.email ?? m.UsuarioEmail
                                    const memberEmail = m.usuarioEmail ?? m.UsuarioEmail ?? m.email
                                    
                                    // Check if current user is admin - using Firebase UID
                                    const adminFirebaseUid = groupDetails?.administradorFirebaseUid ?? groupDetails?.AdministradorFirebaseUid
                                    const adminDbId = groupDetails?.administradorId ?? groupDetails?.AdministradorId
                                    const currentUid = user?.uid ?? user?.email
                                    const amIAdmin = !!(adminFirebaseUid && currentUid && String(adminFirebaseUid) === String(currentUid)) || 
                                                    !!(members.find(mem => {
                                                        const memFirebaseUid = mem.usuarioFirebaseUid ?? mem.UsuarioFirebaseUid
                                                        return String(memFirebaseUid) === String(currentUid) && mem.esAdministrador
                                                    }))
                                    
                                    const isThisMemberAdmin = m.esAdministrador || m.EsAdministrador
                                    
                                    // Debug logging for admin detection
                                    if (idx === 0) {
                                        console.log('[GroupChat Docked] Admin detection:', {
                                            adminFirebaseUid, adminDbId, currentUid, amIAdmin, 
                                            groupDetails: groupDetails,
                                            currentMember: { memberId, memberName, isThisMemberAdmin }
                                        })
                                    }
                                    
                                    return (
                                        <div key={`${memberId ?? idx}`} style={{ 
                                            fontSize: 13, 
                                            color: 'var(--light)', 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            marginBottom: 4,
                                            padding: '4px 0'
                                        }}>
                                            <div>
                                                <span>{memberName}</span>
                                                {isThisMemberAdmin && <span style={{ color: 'var(--primary)', fontSize: 11, marginLeft: 4 }}>(Admin)</span>}
                                            </div>
                                            {memberId && !isThisMemberAdmin && (
                                                <button 
                                                    onClick={() => removeMember(String(memberId))}
                                                    disabled={removingMember === String(memberId)}
                                                    style={{
                                                        background: amIAdmin ? (removingMember === String(memberId) ? '#6c757d' : '#dc3545') : '#6c757d',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '2px 6px',
                                                        borderRadius: 4,
                                                        fontSize: 11,
                                                        cursor: removingMember === String(memberId) ? 'not-allowed' : 'pointer',
                                                        opacity: removingMember === String(memberId) ? 0.6 : 1
                                                    }}
                                                    title={amIAdmin ? 'Remover miembro' : 'Solo admins pueden remover'}
                                                >
                                                    {removingMember === String(memberId) ? 'Removiendo...' : (amIAdmin ? 'Remover' : 'No admin')}
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={onClose} className={styles.button}>Cerrar</button>
                    </div>
                </div>
                <div className={styles.messages}>
                    {messages.map((m: any) => (
                        <div key={m.id} className={styles.message}>
                            <div style={{ fontWeight: 700 }}>{m.usuarioNombre ?? m.usuarioNombre ?? m.usuarioNombre}</div>
                            <div>{m.mensaje ?? m.Mensaje ?? m.Mensaje}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                            {(() => {
                                const originalDate = m.fechaEnvio ?? m.FechaEnvio;
                                // Force the date to be interpreted as UTC by adding 'Z' if it doesn't have timezone info
                                const dateString = originalDate.includes('Z') || originalDate.includes('+') || originalDate.includes('T') && originalDate.split('T')[1].includes('-') 
                                    ? originalDate 
                                    : originalDate + 'Z';
                                const date = new Date(dateString);
                                const baTime = date.toLocaleString('es-AR', { 
                                    timeZone: 'America/Argentina/Buenos_Aires',
                                    year: 'numeric',
                                    month: '2-digit', 
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: false
                                });
                                console.log('[Message Date Fixed]', {original: originalDate, adjusted: dateString, parsed: date.toISOString(), baTime});
                                return baTime;
                            })()}
                        </div>
                        </div>
                    ))}
                </div>
                <div className={styles.composer}>
                    <input value={input} onChange={e => setInput(e.target.value)} placeholder="Escribe un mensaje..." />
                    <button className={styles.send} onClick={sendMessage}>Enviar</button>
                </div>
                {status && <div className={styles.status}>{status}</div>}
            </div>
        ) : (
            <div className={styles.overlay}>
                <div className={styles.modal}>
                    <div className={styles.header}>
                        <strong>{grupoNombre ?? 'Grupo'}</strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            
                            {members && members.length > 0 && (
                                <button className={styles.button} onClick={() => setShowMembers(!showMembers)}>{showMembers ? 'Ocultar miembros' : `Ver miembros (${members.length})`}</button>
                            )}
                            <button onClick={onClose} className={styles.button}>Cerrar</button>
                        </div>
                    </div>
                    {/* Members list in modal mode */}
                    {showMembers && members && (
                        <div key={`members-${members.length}-${Date.now()}`} style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', maxHeight: 200, overflow: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <h4 style={{ margin: 0, fontSize: 14 }}>Miembros del grupo ({members.length})</h4>
                                <button 
                                    onClick={loadGroupDetails}
                                    style={{ 
                                        background: '#007bff', 
                                        color: 'white', 
                                        border: 'none', 
                                        padding: '2px 6px', 
                                        borderRadius: 4, 
                                        fontSize: 11, 
                                        cursor: 'pointer' 
                                    }}
                                >
                                    Refrescar
                                </button>
                            </div>
                            {members.map((m: any, idx: number) => {
                                const memberId = m.usuarioId ?? m.UsuarioId ?? m.id ?? m.Id
                                const memberName = m.usuarioNombre ?? m.UsuarioNombre ?? m.nombre ?? m.displayName ?? m.email ?? m.UsuarioEmail
                                const memberEmail = m.usuarioEmail ?? m.UsuarioEmail ?? m.email
                                
                                // Check if current user is admin - using Firebase UID
                                const adminFirebaseUid = groupDetails?.administradorFirebaseUid ?? groupDetails?.AdministradorFirebaseUid
                                const adminDbId = groupDetails?.administradorId ?? groupDetails?.AdministradorId
                                const currentUid = user?.uid ?? user?.email
                                const amIAdmin = !!(adminFirebaseUid && currentUid && String(adminFirebaseUid) === String(currentUid)) || 
                                                !!(members.find(mem => {
                                                    const memFirebaseUid = mem.usuarioFirebaseUid ?? mem.UsuarioFirebaseUid
                                                    return String(memFirebaseUid) === String(currentUid) && mem.esAdministrador
                                                }))
                                
                                const isThisMemberAdmin = m.esAdministrador || m.EsAdministrador
                                
                                // Debug logging for admin detection
                                if (idx === 0) {
                                    console.log('[GroupChat Modal] Admin detection:', {
                                        adminFirebaseUid, adminDbId, currentUid, amIAdmin, 
                                        groupDetails: groupDetails,
                                        currentMember: { memberId, memberName, isThisMemberAdmin }
                                    })
                                }
                                
                                return (
                                    <div key={`${memberId ?? idx}`} style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        marginBottom: 6,
                                        padding: '4px 8px',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: 6
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--white)' }}>{memberName}</div>
                                            {memberEmail && <div style={{ fontSize: 12, color: 'var(--light)' }}>{memberEmail}</div>}
                                            {isThisMemberAdmin && <div style={{ color: 'var(--primary)', fontSize: 11 }}>Administrador</div>}
                                        </div>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {memberId && !isThisMemberAdmin && (
                                                <button 
                                                    onClick={() => removeMember(String(memberId))}
                                                    disabled={removingMember === String(memberId)}
                                                    style={{
                                                        background: amIAdmin ? (removingMember === String(memberId) ? '#6c757d' : '#dc3545') : '#6c757d',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '4px 8px',
                                                        borderRadius: 4,
                                                        fontSize: 12,
                                                        cursor: removingMember === String(memberId) ? 'not-allowed' : 'pointer',
                                                        opacity: removingMember === String(memberId) ? 0.6 : 1
                                                    }}
                                                    title={amIAdmin ? 'Remover miembro' : 'Solo admins pueden remover'}
                                                >
                                                    {removingMember === String(memberId) ? 'Removiendo...' : (amIAdmin ? 'Remover' : 'No admin')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    <div className={styles.messages} ref={messagesRef}>
                        {messages.map((m: any) => {
                            const msgUserId = m.usuarioId ?? m.UsuarioId ?? m.usuarioId?.toString() ?? m.UsuarioId?.toString()
                            const msgUserName = (m.usuarioNombre ?? m.UsuarioNombre ?? m.usuarioNombre ?? m.UsuarioNombre ?? '').toString()
                            const isMine = user && ((msgUserId && msgUserId.toString() === user.uid) || (msgUserName && String(msgUserName).toLowerCase() === String(user.displayName ?? user.email).toLowerCase()))
                            return (
                                <div key={m.id} className={`${styles.message} ${isMine ? styles.mine : styles.other}`}>
                                    <div style={{ fontWeight: 700 }}>{m.usuarioNombre ?? m.usuarioNombre ?? m.usuarioNombre}</div>
                                    <div>{m.mensaje ?? m.Mensaje ?? m.Mensaje}</div>
                                    <div style={{ fontSize: 12, color: '#999' }}>
                                        {(() => {
                                            const originalDate = m.fechaEnvio ?? m.FechaEnvio;
                                            // Force the date to be interpreted as UTC by adding 'Z' if it doesn't have timezone info
                                            const dateString = originalDate.includes('Z') || originalDate.includes('+') || originalDate.includes('T') && originalDate.split('T')[1].includes('-') 
                                                ? originalDate 
                                                : originalDate + 'Z';
                                            const date = new Date(dateString);
                                            return date.toLocaleString('es-AR', { 
                                                timeZone: 'America/Argentina/Buenos_Aires',
                                                year: 'numeric',
                                                month: '2-digit', 
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit',
                                                hour12: false
                                            });
                                        })()}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className={styles.composer}>
                        <input id={`chat-input-${grupoId}`} value={input} onChange={e => setInput(e.target.value)} placeholder="Escribe un mensaje..." />
                        <button className={styles.send} onClick={sendMessage}>Enviar</button>
                    </div>
                    {status && <div className={styles.status}>{status}</div>}
                </div>
            </div>
        )
    )
}
