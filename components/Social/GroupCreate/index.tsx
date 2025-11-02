'use client'
import { useState } from 'react'
import styles from './page.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/navigation'
import { createGroup } from '@/app/actions/groups'

export default function GroupCreate({
    handleCancel,
}: {
    handleCancel: () => void
}) {
    const router = useRouter()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!name || !description) return

        setLoading(true)
        try {
            const result = await createGroup({ name, description })
            if (!result.success) {
                alert(result.error)
                return
            }

            setName('')
            setDescription('')
            alert('Grupo creado!')
            handleCancel()
            router.refresh()
        } catch (err) {
            console.error(err)
            alert('Hubo un error creando el grupo')
        } finally {
            setLoading(false)
        }
    }

    return (
        <aside className={styles.create}>
            <div className={styles.create__container}>
                <FontAwesomeIcon icon={faPen} className={styles.create__icon} />
            </div>
            <input
                type="text"
                placeholder="Ingrese Nombre del Grupo"
                value={name}
                onChange={e => setName(e.target.value)}
                className={styles.create__input}
            />
            <input
                type="text"
                placeholder="Ingrese Descripcion del Grupo"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className={styles.create__input}
            />
            <div className={styles.create__buttons}>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={styles.create__button}
                >
                    Guardar y Crear
                </button>
                <button
                    onClick={() => {
                        setName('')
                        setDescription('')
                        handleCancel()
                    }}
                    className={styles.create__cancel}
                >
                    Cancelar
                </button>
            </div>
        </aside>
    )
}
