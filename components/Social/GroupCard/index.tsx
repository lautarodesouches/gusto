'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './page.module.css'
import { faUsers } from '@fortawesome/free-solid-svg-icons'
import { Group } from '@/types'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { getProfile } from '@/app/actions/profile'

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
                    const result = await getProfile(firstMember.usuarioUsername)

                    if (result.success && result.data?.fotoPerfilUrl) {
                        setFirstMemberPhoto(result.data.fotoPerfilUrl)
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
                        <Image
                            src={firstMemberPhoto}
                            alt={group.nombre}
                            width={40}
                            height={40}
                            className={styles.group__img}
                        />
                    ) : (
                        <FontAwesomeIcon icon={faUsers} />
                    )}
                </div>
            </Link>
        )
    }

    return (
        <li className={styles.group}>
            <Link
                href={`/group/${group.id}/`}
                className={styles.group__link}
            >
                <div className={styles.group__img}>
                    {firstMemberPhoto ? (
                        <Image
                            src={firstMemberPhoto}
                            alt={group.nombre}
                            width={40}
                            height={40}
                            className={styles.group__img}
                        />
                    ) : (
                        <FontAwesomeIcon icon={faUsers} />
                    )}
                </div>
                <div className={styles.group__data}>
                    <p className={styles.group__name}>{group.nombre}</p>
                    <p className={styles.group__user}>{group.cantidadMiembros}</p>
                </div>
            </Link>
        </li>
    )
}
