'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './page.module.css'
import { faUsers } from '@fortawesome/free-solid-svg-icons'
import { Group } from '@/types'
import Link from 'next/link'

export default function GroupCard({ 
    group, 
    showOnlyImage = false 
}: { 
    group: Group
    showOnlyImage?: boolean
}) {
    // Si solo se muestra la imagen (modo compacto)
    if (showOnlyImage) {
        return (
            <Link
                href={`/group/${group.id}/`}
                className={styles.group__image_only}
            >
                <div className={styles.group__img}>
                    <FontAwesomeIcon icon={faUsers} />
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
                    <FontAwesomeIcon icon={faUsers} />
                </div>
                <div className={styles.group__data}>
                    <p className={styles.group__name}>{group.nombre}</p>
                    <p className={styles.group__user}>{group.cantidadMiembros}</p>
                </div>
            </Link>
        </li>
    )
}
