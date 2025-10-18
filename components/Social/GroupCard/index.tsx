'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './page.module.css'
import { faInfo, faUsers } from '@fortawesome/free-solid-svg-icons'
import { Group } from '@/types'
import { useRouter } from 'next/navigation'

export default function GroupCard({ group }: { group: Group }) {
    const router = useRouter()

    const handleGoDetail = () => {
        return router.push(`/group/${group.id}/`)
    }

    return (
        <li className={styles.group}>
            <div className={styles.group__img}>
                <FontAwesomeIcon icon={faUsers} />
            </div>
            <div className={styles.group__data}>
                <p className={styles.group__name}>{group.nombre}</p>
                <p className={styles.group__user}>{group.cantidadMiembros}</p>
            </div>
            <div className={styles.group__info}>
                <FontAwesomeIcon
                    icon={faInfo}
                    className={styles.group__icon}
                    onClick={handleGoDetail}
                />
            </div>
        </li>
    )
}
