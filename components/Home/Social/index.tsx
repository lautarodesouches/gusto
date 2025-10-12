"use client"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './page.module.css'
import { faClose, faInfo, faPlus, faUser } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'

interface Props {
    isVisible: boolean
    handleClose: () => void
    friends: { image: string; name: string; user: string }[]
    groups: { name: string; numberOfMembers: number }[]
}

export default function Social({
    friends,
    groups,
    isVisible,
    handleClose,
}: Props) {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [status, setStatus] = useState<string | null>(null)
    const [solicitudes, setSolicitudes] = useState<any[]>([])
    const [misAmigos, setMisAmigos] = useState<any[]>([])

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5174'

    async function enviarSolicitud() {
        setStatus('Enviando...')
        try {
            const res = await fetch(`${API_BASE}/Amistad/enviar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailDestino: email, mensaje: message }),
                credentials: 'include'
            })
            if (!res.ok) {
                const txt = await res.text()
                setStatus('Error: ' + txt)
                return
            }
            const data = await res.json()
            setStatus('Solicitud enviada')
        } catch (e: any) {
            setStatus('Error: ' + e.message)
        }
    }

    async function cargarSolicitudes() {
        try {
            const res = await fetch(`${API_BASE}/Amistad/solicitudes`, { credentials: 'include' })
            const data = await res.json()
            setSolicitudes(data)
        } catch (e) {
            console.error(e)
        }
    }

    async function cargarAmigos() {
        try {
            const res = await fetch(`${API_BASE}/Amistad/amigos`, { credentials: 'include' })
            const data = await res.json()
            setMisAmigos(data)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <section className={`${styles.social} ${isVisible ? styles.show : ''}`}>
            <header className={styles.social__header}>
                <h2 className={styles.social__title}>Social</h2>
                <FontAwesomeIcon
                    icon={faClose}
                    className={styles.social__close}
                    onClick={handleClose}
                />
            </header>
            <div className={styles.social__content}>
                <div className={styles.social__buttons}>
                    <button className={styles.social__button} onClick={() => { cargarSolicitudes(); }}>
                        <FontAwesomeIcon icon={faPlus} />
                        Ver solicitudes
                    </button>
                    <button className={styles.social__button} onClick={() => { cargarAmigos(); }}>
                        <FontAwesomeIcon icon={faPlus} />
                        Ver amigos
                    </button>
                </div>

                <div style={{ padding: 12 }}>
                    <h4>Buscar usuario por email</h4>
                    <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@ejemplo.com" />
                    <br />
                    <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Mensaje opcional" />
                    <br />
                    <button onClick={enviarSolicitud}>Enviar solicitud</button>
                    {status && <p>{status}</p>}
                </div>

                <div className={styles.social__div}>
                    <h3 className={styles.social__description}>Solicitudes pendientes</h3>
                    <hr className={styles.social__line} />
                    <ul className={styles.social__list}>
                        {solicitudes.map((s: any) => (
                            <li className={styles.user} key={s.id}>
                                <div className={styles.user__img}><FontAwesomeIcon icon={faUser} /></div>
                                <div className={styles.user__data}>
                                    <p className={styles.user__name}>{s.remitente.nombre}</p>
                                    <p className={styles.user__user}>{s.remitente.email}</p>
                                </div>
                                <div className={styles.user__info}>
                                    <button onClick={async () => {
                                        await fetch(`/Amistad/${s.id}/aceptar`, { method: 'POST' })
                                        cargarSolicitudes(); cargarAmigos()
                                    }}>Aceptar</button>
                                    <button onClick={async () => { await fetch(`/Amistad/${s.id}/rechazar`, { method: 'POST' }); cargarSolicitudes(); }}>Rechazar</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={styles.social__div}>
                    <h3 className={styles.social__description}>Mis amigos</h3>
                    <hr className={styles.social__line} />
                    <ul className={styles.social__list}>
                        {misAmigos.map((a: any) => (
                            <li className={styles.user} key={a.id}>
                                <div className={styles.user__img}><FontAwesomeIcon icon={faUser} /></div>
                                <div className={styles.user__data}>
                                    <p className={styles.user__name}>{a.nombre}</p>
                                    <p className={styles.user__user}>{a.email}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    )
}
