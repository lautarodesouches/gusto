'use client'
import { useState } from 'react'
import styles from './page.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen } from '@fortawesome/free-solid-svg-icons'
import { createGroup } from '@/app/actions/groups'
import { useToast } from '@/context/ToastContext'

export default function GroupCreate({
    handleCancel,
}: {
    handleCancel: () => void
}) {
    const toast = useToast()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!name || !description) return

        setLoading(true)

        try {
            const result = await createGroup({ name, description })

            if (!result.success)
                return toast.error(result.error || `No se pudo crear grupo`)

            toast.success(`Grupo "${name}" creado exitosamente`)

            setName('')
            setDescription('')
            handleCancel()
        } catch (err) {
            toast.error(`No se pudo crear grupo`)
            console.error(err)
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
