"use client"
import React, { useState, useEffect } from 'react'
import styles from './page.module.css'
import { useAuth } from '@/context/AuthContext'

interface Props {
    openFullSocial: () => void
}

export default function SocialSidebar({ openFullSocial }: Props) {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5174'
    const { token } = useAuth()
    const { user } = useAuth()

    // Invite-by-email removed; we invite via search selection
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null)
    const [selectedUserName, setSelectedUserName] = useState<string | null>(null)
    const [status, setStatus] = useState<string | null>(null)
    const [requestsCount, setRequestsCount] = useState<number | null>(null)
    const [friendsCount, setFriendsCount] = useState<number | null>(null)
    const [friends, setFriends] = useState<any[]>([])
    const [usernameQuery, setUsernameQuery] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [myGroups, setMyGroups] = useState<any[]>([])
    const [creatingGroup, setCreatingGroup] = useState(false)
        const [openChatGrupoId, setOpenChatGrupoId] = useState<string | null>(null)
        const [openChatGrupoNombre, setOpenChatGrupoNombre] = useState<string | null>(null)
        const [openChatMode, setOpenChatMode] = useState<'modal'|'docked'>('modal')
    const [groupInvitations, setGroupInvitations] = useState<any[]>([])
    const [friendRequests, setFriendRequests] = useState<any[]>([])
    // track which groups have their member list expanded in the sidebar
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

    const authHeaders = () => {
        const h: Record<string, string> = { 'Content-Type': 'application/json' }
        if (token) h['Authorization'] = `Bearer ${token}`
        return h
    }

    // Auto-load social data when the component mounts or when auth token changes
    useEffect(() => {
        // only load when we have a token (user is authenticated)
        if (!token) return
        (async () => {
            await Promise.all([
                loadFriends(),
                loadFriendRequests(),
                loadMyGroups(),
                loadGroupInvitations(),
                loadRequestsCount()
            ])
        })()
    }, [token])

    // sendInvite removed: use search + backend EnviarSolicitud endpoint

    async function loadRequestsCount() {
        try {
            const res = await fetch(`${API_BASE}/Amistad/solicitudes`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
            if (!res.ok) return
            const data = await res.json()
            setRequestsCount(Array.isArray(data) ? data.length : null)
        } catch (e) {
            console.error(e)
        }
    }

    async function loadFriends() {
        try {
            const res = await fetch(`${API_BASE}/Amistad/amigos`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
            if (!res.ok) {
                const txt = await res.text()
                setStatus('Error cargando amigos: ' + txt)
                return
            }
            const data = await res.json()
            const arr = Array.isArray(data) ? data : []
            setFriends(arr)
            setFriendsCount(arr.length)
        } catch (e) {
            console.error(e)
            setStatus('Error cargando amigos: ' + String(e))
        }
    }

    async function searchByUsername(q?: string) {
        const query = q !== undefined ? q : usernameQuery
        try {
            const base = `${API_BASE}/Amistad/buscar-usuarios`
            const url = (query === null || query === undefined || String(query).trim() === '') ? base : `${base}?q=${encodeURIComponent(query)}`
            const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
            if (!res.ok) {
                const txt = await res.text()
                setStatus('Error buscando usuarios: ' + txt)
                setSearchResults([])
                return
            }
            const data = await res.json()
            setSearchResults(Array.isArray(data) ? data : [])
            setStatus(null)
        } catch (e: any) {
            console.error(e)
            setStatus('Error buscando usuarios: ' + String(e))
            setSearchResults([])
        }
    }

    function selectResultAndInvite(u: any) {
        // accept different shapes: id / Id / uid
        const uid = u?.id ?? u?.Id ?? u?.uid ?? u?.usuarioId ?? u?.usuario?.id
        if (uid) setSelectedUserId(String(uid))
        if (u?.email) setSelectedUserEmail(u.email)
        setSelectedUserName(u.nombre ?? u.displayName ?? u.name)
        setStatus(`Seleccionado ${u.nombre ?? u.displayName ?? uid ?? 'usuario'} para invitar a grupos`)
    }

    async function createGroup() {
        const name = prompt('Nombre del nuevo grupo')
        if (!name) return
        setCreatingGroup(true)
        try {
            const res = await fetch(`${API_BASE}/Grupo/crear`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ Nombre: name, Descripcion: '' }),
            })
            setCreatingGroup(false)
            if (!res.ok) {
                const txt = await res.text()
                setStatus('Error creando grupo: ' + txt)
                return
            }
            const data = await res.json()
            setStatus(`Grupo "${data.nombre ?? name}" creado`)
            // recargar mis grupos
            await loadMyGroups()
        } catch (e) {
            setCreatingGroup(false)
            setStatus('Error creando grupo: ' + String(e))
        }
    }

    async function loadMyGroups() {
        try {
            const headers: Record<string, string> | undefined = token ? { Authorization: `Bearer ${token}` } : undefined
            const res = await fetch(`${API_BASE}/Grupo/mis-grupos`, { headers })
            if (!res.ok) {
                const txt = await res.text()
                setStatus('Error cargando grupos: ' + txt)
                return
            }
            const data = await res.json()
            setMyGroups(Array.isArray(data) ? data : [])
        } catch (e) {
            console.error(e)
            setStatus('Error cargando grupos: ' + String(e))
        }
    }

    async function loadGroupInvitations() {
        try {
            const res = await fetch(`${API_BASE}/Grupo/invitaciones`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
            if (!res.ok) {
                const txt = await res.text()
                setStatus('Error cargando invitaciones: ' + txt)
                return
            }
            const data = await res.json()
            setGroupInvitations(Array.isArray(data) ? data : [])
        } catch (e) {
            console.error(e)
            setStatus('Error cargando invitaciones: ' + String(e))
        }
    }

    async function acceptGroupInvitation(invitacionId: string) {
        setStatus('Aceptando invitación...')
        try {
            const res = await fetch(`${API_BASE}/Grupo/invitaciones/${invitacionId}/aceptar`, {
                method: 'POST',
                headers: authHeaders(),
            })
            if (!res.ok) {
                const txt = await res.text()
                setStatus('Error aceptando invitación: ' + txt)
                return
            }
            setStatus('Invitación aceptada')
            // recargar datos
            await loadMyGroups()
            await loadGroupInvitations()
        } catch (e) {
            console.error(e)
            setStatus('Error aceptando invitación: ' + String(e))
        }
    }

    async function loadFriendRequests() {
        try {
            const res = await fetch(`${API_BASE}/Amistad/solicitudes`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
            if (!res.ok) {
                const txt = await res.text()
                setStatus('Error cargando solicitudes: ' + txt)
                return
            }
            const data = await res.json()
            setFriendRequests(Array.isArray(data) ? data : [])
        } catch (e) {
            console.error(e)
            setStatus('Error cargando solicitudes: ' + String(e))
        }
    }

    async function acceptFriendRequest(solicitudId: string) {
        setStatus('Aceptando solicitud...')
        try {
            const res = await fetch(`${API_BASE}/Amistad/${solicitudId}/aceptar`, { method: 'POST', headers: authHeaders() })
            if (!res.ok) {
                const txt = await res.text()
                setStatus('Error aceptando solicitud: ' + txt)
                return
            }
            setStatus('Solicitud aceptada')
            await loadFriendRequests()
            // opcional: recargar contadores / amigos
            await loadRequestsCount()
        } catch (e) {
            console.error(e)
            setStatus('Error aceptando solicitud: ' + String(e))
        }
    }

    async function rejectFriendRequest(solicitudId: string) {
        setStatus('Rechazando solicitud...')
        try {
            const res = await fetch(`${API_BASE}/Amistad/${solicitudId}/rechazar`, { method: 'POST', headers: authHeaders() })
            if (!res.ok) {
                const txt = await res.text()
                setStatus('Error rechazando solicitud: ' + txt)
                return
            }
            setStatus('Solicitud rechazada')
            await loadFriendRequests()
            await loadRequestsCount()
        } catch (e) {
            console.error(e)
            setStatus('Error rechazando solicitud: ' + String(e))
        }
    }

    async function inviteUserToGroup(grupoId: string, userIdOrEmail?: string) {
        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`

            const body: any = { MensajePersonalizado: 'Te invito a un grupo' }
            const selectedValue = (selectedUserId ?? userIdOrEmail ?? selectedUserEmail ?? '').trim()
            const isGuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(selectedValue)
            const isEmail = /@/.test(selectedValue)
            if (isGuid) body.UsuarioId = selectedValue
            else if (isEmail) body.EmailUsuario = selectedValue
            else if (selectedValue) body.UsuarioUsername = selectedValue

            const res = await fetch(`${API_BASE}/Grupo/${grupoId}/invitar`, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            })
            if (!res.ok) {
                const txt = await res.text()
                setStatus('Error invitando: ' + txt)
                return
            }
            setStatus('Invitación enviada')
            // refresh group invites/members
            await loadGroupInvitations()
            await loadMyGroups()
        } catch (e) {
            setStatus('Error invitando: ' + String(e))
        }
    }

    async function sendFriendRequest(userEmail: string) {
        setStatus('Enviando solicitud de amistad...')
        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch(`${API_BASE}/Amistad/enviar`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ EmailDestino: userEmail, Mensaje: 'Hola, te envío una solicitud de amistad' })
            })
            if (!res.ok) {
                const txt = await res.text()
                setStatus('Error enviando solicitud: ' + txt)
                return
            }
            setStatus('Solicitud enviada')
            await loadRequestsCount()
        } catch (e) {
            console.error(e)
            setStatus('Error enviando solicitud: ' + String(e))
        }
    }

    async function leaveGroup(grupoId: string) {
        setStatus('Saliendo del grupo...')
        try {
            const idStr = String(grupoId)
            const url = `${API_BASE}/Grupo/${encodeURIComponent(idStr)}/abandonar`
            console.log('[SocialSidebar] POST abandonar group url:', url)
            const res = await fetch(url, { method: 'POST', headers: authHeaders() })
            if (!res.ok) {
                const txt = await res.text()
                setStatus('Error abandonando grupo: ' + txt)
                return
            }
            setStatus('Has salido del grupo')
            await loadMyGroups()
            await loadGroupInvitations()
        } catch (e) {
            console.error(e)
            setStatus('Error abandonando grupo: ' + String(e))
        }
    }

    async function removeMember(grupoId: string, usuarioId: string) {
        setStatus('Removiendo miembro...')
        try {
            if (!confirm('¿Remover este miembro del grupo?')) return
            const gid = String(grupoId)
            const uid = String(usuarioId)
            const url = `${API_BASE}/Grupo/${encodeURIComponent(gid)}/miembros/${encodeURIComponent(uid)}`
            console.log('[SocialSidebar] DELETE remover miembro url:', url)
            const res = await fetch(url, { method: 'DELETE', headers: authHeaders() })
            if (!res.ok) {
                const txt = await res.text()
                setStatus('Error removiendo miembro: ' + txt)
                return
            }
            setStatus('Miembro removido')
            await loadMyGroups()
            await loadGroupInvitations()
        } catch (e) {
            console.error(e)
            setStatus('Error removiendo miembro: ' + String(e))
        }
    }

    async function removeFriend(friendId: string) {
        setStatus('Eliminando amigo...')
        try {
            const friendIdStr = String(friendId)
            const url = `${API_BASE}/Amistad/${encodeURIComponent(friendIdStr)}`
            // diagnostic log to help backend routing issues (404 on invalid GUID)
            console.log('[SocialSidebar] DELETE friend url:', url, 'friendId:', friendIdStr)
            const res = await fetch(url, { method: 'DELETE', headers: authHeaders() })
            if (!res.ok) {
                const txt = await res.text()
                if (res.status === 404) {
                    setStatus('Error eliminando amigo: Not Found (404). Verifica que el id enviado sea el id de usuario (GUID). Response: ' + txt)
                } else {
                    setStatus('Error eliminando amigo: ' + txt)
                }
                return
            }
            setStatus('Amigo eliminado')
            await loadFriends()
            await loadRequestsCount()
            await loadMyGroups()
        } catch (e) {
            console.error(e)
            setStatus('Error eliminando amigo: ' + String(e))
        }
    }

    async function deleteGroup(grupoId: string) {
        setStatus('Eliminando grupo...')
        try {
            const idStr = String(grupoId)
            const url = `${API_BASE}/Grupo/${encodeURIComponent(idStr)}`
            console.log('[SocialSidebar] DELETE group url:', url)
            const res = await fetch(url, { method: 'DELETE', headers: authHeaders() })
            if (!res.ok) {
                const txt = await res.text()
                if (res.status === 404) setStatus('Grupo no encontrado: ' + txt)
                else setStatus('Error eliminando grupo: ' + txt)
                return
            }
            setStatus('Grupo eliminado')
            await loadMyGroups()
            await loadGroupInvitations()
        } catch (e) {
            console.error(e)
            setStatus('Error eliminando grupo: ' + String(e))
        }
    }

    return (
        <aside className={styles.sidebar}>
            <h3 className={styles.title}>Social</h3>

            <div className={styles.section}>
                <button className={styles.button} onClick={createGroup} disabled={creatingGroup}>
                    {creatingGroup ? 'Creando...' : 'Crear grupo'}
                </button>
                <button className={styles.button} onClick={() => { loadRequestsCount(); openFullSocial(); }}>
                    Ver solicitudes {requestsCount !== null ? `(${requestsCount})` : ''}
                </button>
            </div>

            <div style={{ marginTop: 12 }}>
                <h4 style={{ margin: 0 }}>Buscar por usuario</h4>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <input value={usernameQuery} onChange={e => setUsernameQuery(e.target.value)} placeholder="username" />
                    <button className={styles.button} onClick={() => searchByUsername()}>Buscar</button>
                    <button className={styles.button} onClick={() => { setUsernameQuery(''); setSearchResults([]); searchByUsername(''); }}>Mostrar todos</button>
                </div>

                {searchResults.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, marginTop: 8 }}>
                        {searchResults.map((r: any) => (
                            <li key={r.id} style={{ padding: 6, borderRadius: 6, background: 'var(--background)', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 700, color: 'var(--white)' }}>{r.nombre}</div>
                                    <div style={{ color: 'var(--light)' }}>{r.email}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    
                                    <button className={styles.button} onClick={() => sendFriendRequest(r.email)}>Agregar amigo</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                <div style={{ marginTop: 12 }}>
                    <h4 style={{ margin: 0 }}>Invitaciones de grupo</h4>
                    
                    {groupInvitations.length === 0 && <p style={{ color: 'var(--light)' }}>No hay invitaciones pendientes</p>}
                    {groupInvitations.map((inv: any) => (
                        <div key={inv.id} style={{ marginTop: 8, padding: 8, borderRadius: 6, background: 'var(--background)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 700, color: 'var(--white)' }}>{inv.nombreGrupo ?? inv.grupoNombre ?? inv.grupo?.nombre}</div>
                                <div style={{ color: 'var(--light)' }}>De: {inv.usuarioInvitadorNombre ?? inv.usuarioInvitador}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button className={styles.button} onClick={() => acceptGroupInvitation(inv.id)}>Aceptar</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 12 }}>
                    <h4 style={{ margin: 0 }}>Solicitudes de amistad</h4>
                    
                    {friendRequests.length === 0 && <p style={{ color: 'var(--light)' }}>No hay solicitudes pendientes</p>}
                    {friendRequests.map((s: any) => (
                        <div key={s.id} style={{ marginTop: 8, padding: 8, borderRadius: 6, background: 'var(--background)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 700, color: 'var(--white)' }}>{s.remitente?.nombre ?? s.remitenteNombre}</div>
                                <div style={{ color: 'var(--light)' }}>{s.remitente?.email ?? s.remitenteEmail}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button className={styles.button} onClick={() => acceptFriendRequest(s.id)}>Aceptar</button>
                                <button className={styles.button} onClick={() => rejectFriendRequest(s.id)}>Rechazar</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0 }}>Mis grupos</h4>
                    </div>
                    {myGroups.length === 0 && <p style={{ color: 'var(--light)' }}>No tienes grupos aún</p>}
                    {myGroups.map((g: any) => {
                        const isExpanded = !!expandedGroups[g.id]
                        const miembros = Array.isArray(g.miembros) ? g.miembros : (Array.isArray(g.Miembros) ? g.Miembros : [])
                        return (
                            <div key={g.id} style={{ marginTop: 8, padding: 8, borderRadius: 6, background: 'var(--background)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, color: 'var(--white)' }}>{g.nombre}</div>
                                        <div style={{ color: 'var(--light)' }}>{g.descripcion}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button className={styles.button} onClick={() => { setOpenChatMode('modal'); setOpenChatGrupoId(g.id); setOpenChatGrupoNombre(g.nombre) }}>Chat</button>

                                        {/* Role-based action buttons: admin can delete (not leave), others can leave */}
                                        {/** Determine admin by comparing group's administradorId, administradorUid or administrador?.uid with current user */}
                                        {(() => {
                                            // Use the Firebase UID field that we added to the backend response
                                            const adminFirebaseUid = g.administradorFirebaseUid
                                            const currentUserUid = user?.uid
                                            const amIAdmin = !!(adminFirebaseUid && currentUserUid && adminFirebaseUid === currentUserUid)
                                            
                                            console.log('[SocialSidebar] Admin detection:', {
                                                groupId: g.id,
                                                groupName: g.nombre,
                                                adminFirebaseUid,
                                                currentUserUid,
                                                amIAdmin
                                            })
                                            
                                            if (amIAdmin) {
                                                return (
                                                    <button className={styles.button} onClick={() => {
                                                        if (!confirm('¿Eliminar el grupo "' + g.nombre + '"? Esta acción no se puede deshacer.')) return
                                                        deleteGroup(g.id)
                                                    }}>Eliminar</button>
                                                )
                                            }
                                            return <button className={styles.button} onClick={() => leaveGroup(g.id)}>Salir</button>
                                        })()}
                                        {/* information / members panel toggle */}
                                        <button className={styles.button} onClick={() => setExpandedGroups(prev => ({ ...prev, [g.id]: !isExpanded }))}>{isExpanded ? 'Ocultar' : 'Invitar'}</button>
                                    </div>
                                </div>

                                {/* member preview - show up to 3 names inline */}
                                <div style={{ marginTop: 8 }}>
                                    {miembros.length > 0 ? (
                                        <div style={{ color: 'var(--light)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            {miembros.slice(0, 3).map((m: any, i: number) => (
                                                <div key={`${m.usuario?.id ?? m.id ?? m.usuarioId ?? m.email ?? m.usuario?.email}-${i}`} style={{ background: 'rgba(255,255,255,0.02)', padding: '4px 8px', borderRadius: 999, fontSize: 12 }}>
                                                    {m.usuario?.nombre ?? m.nombre ?? m.usuarioNombre ?? m.displayName ?? m.usuario?.email ?? m.email}
                                                </div>
                                            ))}
                                            {miembros.length > 3 && <div style={{ color: 'var(--light)', alignSelf: 'center' }}>+{miembros.length - 3} más</div>}
                                        </div>
                                    ) : (
                                        <div style={{ color: 'var(--light)' }}>{g.cantidadMiembros ? `${g.cantidadMiembros} miembros` : 'Sin miembros'}</div>
                                    )}
                                </div>

                                {/* expanded full member list + admin + invite box */}
                                {isExpanded && (
                                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                                        {/* admin display */}
                                        <div style={{ marginBottom: 8 }}>
                                            <div style={{ fontSize: 12, color: 'var(--light)' }}>Invita a un amigo!</div>
                                            
                                        </div>

                                        {/* invite input */}
                                        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                                            <input placeholder="User a invitar" value={selectedUserEmail ?? ''} onChange={e => setSelectedUserEmail(e.target.value)} style={{ flex: 1 }} />
                                            <button className={styles.button} onClick={() => {
                                                if (!selectedUserEmail) { setStatus('Ingresa un user para invitar'); return }
                                                inviteUserToGroup(g.id, selectedUserEmail)
                                            }}>Invitar</button>
                                        </div>

                                        {miembros.map((m: any, idx: number) => {
                                            const memberId = m.usuario?.id ?? m.id ?? m.usuarioId ?? m.usuario?.usuarioId
                                            const memberEmail = m.usuario?.email ?? m.email
                                            const memberName = m.usuario?.nombre ?? m.nombre ?? m.usuarioNombre ?? m.displayName ?? memberEmail
                                            
                                            // determine current user's admin status for this group
                                            const adminId = g.administradorId ?? g.administradorUid ?? g.administrador?.uid ?? g.administrador?.id
                                            const currentUid = user?.uid ?? user?.email
                                            const amIAdmin = !!(adminId && currentUid && String(adminId) === String(currentUid)) || 
                                                            !!(miembros.find((mem: any) => {
                                                                const memId = mem.usuario?.id ?? mem.id ?? mem.usuarioId
                                                                return String(memId) === String(currentUid) && mem.esAdministrador
                                                            }))
                                            
                                            const isThisMemberAdmin = m.esAdministrador || String(memberId) === String(adminId)
                                            
                                            // Debug logging
                                            if (idx === 0) {
                                                console.log('[SocialSidebar] Debug admin check:', {
                                                    grupoId: g.id,
                                                    grupoNombre: g.nombre,
                                                    adminId,
                                                    currentUid,
                                                    amIAdmin,
                                                    memberCount: miembros.length,
                                                    currentMember: { memberId, memberName, memberEmail, esAdministrador: m.esAdministrador }
                                                })
                                            }
                                            
                                            return (
                                                <div key={`${memberId ?? idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: 'var(--white)' }}>{memberName}</div>
                                                        <div style={{ color: 'var(--light)' }}>{memberEmail ?? ''}</div>
                                                        {isThisMemberAdmin && <div style={{ color: 'var(--primary)', fontSize: 12 }}>Administrador</div>}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        {amIAdmin && !isThisMemberAdmin && memberId && (
                                                            <button 
                                                                className={styles.button} 
                                                                onClick={() => removeMember(g.id, String(memberId))}
                                                                style={{ background: '#dc3545', color: 'white' }}
                                                            >
                                                                Remover
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                <div style={{ marginTop: 12 }}>
                    <h4 style={{ margin: 0 }}>Mis amigos {friendsCount !== null ? `(${friendsCount})` : ''}</h4>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        <button className={styles.button} onClick={() => { loadFriends(); loadFriendRequests(); }}>Cargar amigos</button>
                    </div>
                    {/* cargar lista de amigos via GET /Amistad/amigos */}
                    {typeof friendsCount === 'number' && friendsCount === 0 && <p style={{ color: 'var(--light)' }}>No tienes amigos aún</p>}
                    {/* we'll reuse friendRequests state to show friend objects fetched by loadFriendRequests or loadFriends if desired */}
                    {friends.length > 0 && friends.map((f: any, idx) => (
                        <div key={`${f.id ?? f.Id ?? f.email ?? f.correo}-${idx}`} style={{ marginTop: 8, padding: 8, borderRadius: 6, background: 'var(--background)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 700, color: 'var(--white)' }}>{f.nombre ?? f.nombreCompleto ?? f.displayName}</div>
                                <div style={{ color: 'var(--light)' }}>{f.email ?? f.correo}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button className={styles.button} onClick={() => removeFriend(f.id ?? f.Id)}>Eliminar</button>
                            </div>
                        </div>
                    ))}
                </div>

                {status && <p className={styles.status}>{status}</p>}
            </div>

            <div className={styles.footer}>
                <small>Panel rápido — para pruebas</small>
            </div>
            {/* Modal chat (opened from buttons inside sidebar) */}
            {openChatGrupoId && openChatMode === 'modal' && (
                <div>
                    {/* @ts-ignore */}
                    {React.createElement(require('../GroupChat').default, { grupoId: openChatGrupoId, grupoNombre: openChatGrupoNombre, onClose: () => { setOpenChatGrupoId(null); setOpenChatGrupoNombre(null); }, docked: false })}
                </div>
            )}
            {/* Floating group tabs (bottom-left) */}
            <div style={{ position: 'fixed', left: 12, bottom: 12, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 9997 }}>
                {myGroups.slice(0,5).map((g: any) => (
                    <div key={g.id} onClick={() => { setOpenChatMode('docked'); setOpenChatGrupoId(g.id); setOpenChatGrupoNombre(g.nombre) }} style={{ background: 'var(--card)', color: 'var(--white)', padding: '8px 10px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.3)', cursor: 'pointer' }}>
                        <div style={{ fontWeight: 700 }}>{g.nombre}</div>
                        <div style={{ background: 'rgba(255,255,255,0.06)', padding: '4px 8px', borderRadius: 999, fontWeight: 700 }}>{(g.miembros && Array.isArray(g.miembros) ? g.miembros.length : g.cantidadMiembros ?? 0)}</div>
                    </div>
                ))}
            </div>
            {/* Docked chat instance if opened by floating tab */}
            {openChatGrupoId && openChatMode === 'docked' && (
                <div>
                    {/* @ts-ignore */}
                    {React.createElement(require('../GroupChat').default, { grupoId: openChatGrupoId, grupoNombre: openChatGrupoNombre, onClose: () => { setOpenChatGrupoId(null); setOpenChatGrupoNombre(null); }, docked: true })}
                </div>
            )}
        </aside>
    )
}
