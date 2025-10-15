'use client'
import { useEffect, useState } from 'react'
import styles from './page.module.css'
import { Group } from '@/types'
import { useParams } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faUser } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'

export default function GroupDetail() {
    const { id } = useParams<{ id: string }>()
    const [group, setGroup] = useState<Group | null>(null)

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

    if (!group) return <p>Cargando detalles...</p>

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault()
        const email = (e.target as HTMLFormElement).elements.namedItem(
            'email'
        ) as HTMLInputElement
        alert(`Invitación enviada a ${email.value}`)
        email.value = ''
    }

    return (
        <main className={styles.main}>
            <nav className={styles.nav}>
                <div className={styles.nav__logo}>
                    <Image
                        src="/images/brand/gusto-center-negative.svg"
                        alt="Logo Gusto!"
                        className={styles.nav__img}
                        width={0}
                        height={0}
                        priority
                    />
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
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <h1>{group.nombre}</h1>
                        <span
                            className={
                                group.activo ? styles.active : styles.inactive
                            }
                        >
                            {group.activo ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>

                    <p className={styles.description}>{group.descripcion}</p>

                    <div className={styles.infoGrid}>
                        <div>
                            <strong>Administrador:</strong>{' '}
                            {group.administradorNombre}
                        </div>
                        <div>
                            <strong>Miembros:</strong> {group.cantidadMiembros}
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

                    <form className={styles.inviteForm} onSubmit={handleInvite}>
                        <h2>Invitar amigos</h2>
                        <div className={styles.inviteRow}>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email del amigo"
                                required
                                className={styles.input}
                            />
                            <button type="submit" className={styles.button}>
                                <i className="fa-solid fa-paper-plane"></i>{' '}
                                Enviar invitación
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    )
}
