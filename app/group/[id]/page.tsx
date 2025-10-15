'use client'
import { useEffect, useState } from 'react'
import styles from './page.module.css'
import { Group } from '@/types'
import { useParams } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faUser } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'
import Link from 'next/link'
import { ROUTES } from '@/routes'

export default function GroupDetail() {
    const { id } = useParams<{ id: string }>()
    const [group, setGroup] = useState<Group | null>(null)
    const [email, setEmail] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const res = await fetch(`/api/group/${id}`)
                const data = await res.json()
                setGroup(data)
            } catch (err) {
                console.error('Error fetching group detail:', err)
            }
        }
        if (id) fetchGroup()
    }, [id])

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!id) return alert('ID de grupo no encontrado')

        setLoading(true)
        try {
            const body = {
                query: email,
                mensajePersonalizado: mensaje,
            }

            const res = await fetch(`/api/group/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.message || 'Error al invitar')

            alert('Invitación enviada correctamente!')
            setEmail('')
            setMensaje('')
        } catch (err: unknown) {
            console.error(err)
            alert('No se pudo enviar la invitación')
        } finally {
            setLoading(false)
        }
    }
    return (
        <main className={styles.main}>
            <nav className={styles.nav}>
                <div className={styles.nav__logo}>
                    <Link href={ROUTES.MAP}>
                        <Image
                            src="/images/brand/gusto-center-negative.svg"
                            alt="Logo Gusto!"
                            className={styles.nav__img}
                            width={0}
                            height={0}
                            priority
                        />
                    </Link>
                </div>
                <div className={styles.nav__icons}>
                    <div className={styles.nav__div}>
                        <FontAwesomeIcon
                            icon={faBell}
                            className={styles.nav__icon}
                        />
                    </div>
                    <div className={styles.nav__div}>
                        <FontAwesomeIcon
                            icon={faUser}
                            className={styles.nav__icon}
                        />
                    </div>
                </div>
            </nav>
            {group ? (
                <div className={styles.container}>
                    <div className={styles.card}>
                        <div className={styles.header}>
                            <h1>{group.nombre}</h1>
                            <span
                                className={
                                    group.activo
                                        ? styles.active
                                        : styles.inactive
                                }
                            >
                                {group.activo ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>

                        <p className={styles.description}>
                            {group.descripcion}
                        </p>

                        <div className={styles.infoGrid}>
                            <div>
                                <strong>Administrador:</strong>{' '}
                                {group.administradorNombre}
                            </div>
                            <div>
                                <strong>Miembros:</strong>{' '}
                                {group.cantidadMiembros}
                            </div>
                            <div>
                                <strong>Código de invitación:</strong>{' '}
                                {group.codigoInvitacion}
                            </div>
                            <div>
                                <strong>Creado:</strong> {group.fechaCreacion}
                            </div>
                        </div>

                        <hr className={styles.divider} />

                        <form
                            className={styles.inviteForm}
                            onSubmit={handleInvite}
                        >
                            <h2>Invitar amigos</h2>
                            <div className={styles.inviteRow}>
                                <input
                                    type="email"
                                    placeholder="Email del amigo"
                                    value={email}
                                    className={styles.input}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Mensaje personalizado"
                                    value={mensaje}
                                    className={styles.input}
                                    onChange={e => setMensaje(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className={styles.button}
                                    disabled={loading}
                                >
                                    {loading ? 'Enviando...' : 'Invitar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                <div className={styles.loading}>Cargando detalles...</div>
            )}
        </main>
    )
}
