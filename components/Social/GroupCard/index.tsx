'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './page.module.css'
import { faInfo, faUsers } from '@fortawesome/free-solid-svg-icons'
import { Group } from '@/types'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function GroupCard({ 
    group, 
    showOnlyImage = false 
}: { 
    group: Group
    showOnlyImage?: boolean
}) {
    const [firstMemberPhoto, setFirstMemberPhoto] = useState<string | null>(null)

    useEffect(() => {
        const fetchFirstMemberPhoto = async () => {
            if (!group.miembros || group.miembros.length === 0) {
                return
            }

            // Obtener la foto del primer miembro
            const firstMember = group.miembros[0]
            if (firstMember?.usuarioUsername) {
                try {
                    const res = await fetch(
                        `/api/social?endpoint=Usuario/${encodeURIComponent(firstMember.usuarioUsername)}/perfil`
                    )

                    if (res.ok) {
                        const data = await res.json()
                        if (data?.fotoPerfilUrl) {
                            setFirstMemberPhoto(data.fotoPerfilUrl)
                        }
                    }
                } catch (error) {
                    console.error('Error fetching member photo:', error)
                }
            }
        }

        fetchFirstMemberPhoto()
    }, [group.miembros])

    // Si solo se muestra la imagen (modo compacto)
    if (showOnlyImage) {
        return (
            <Link
                href={`/group/${group.id}/`}
                className={styles.group__image_only}
            >
                <div className={styles.group__img}>
                    {firstMemberPhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={firstMemberPhoto} alt={group.nombre} />
                    ) : (
                        <FontAwesomeIcon icon={faUsers} />
                    )}
                </div>
            </Link>
        )
    }

    return (
        <li className={styles.group}>
            <div className={styles.group__img}>
                {firstMemberPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={firstMemberPhoto} alt={group.nombre} />
                ) : (
                    <FontAwesomeIcon icon={faUsers} />
                )}
            </div>
            <div className={styles.group__data}>
                <p className={styles.group__name}>{group.nombre}</p>
                <p className={styles.group__user}>{group.cantidadMiembros}</p>
            </div>
            <div className={styles.group__info}>
                <Link href={`/group/${group.id}/`}>
                    <FontAwesomeIcon
                        icon={faInfo}
                        className={styles.group__icon}
                    />
                </Link>
            </div>
        </li>
    )
}
