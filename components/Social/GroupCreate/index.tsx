'use client'
import { useState } from 'react'
import styles from './page.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen } from '@fortawesome/free-solid-svg-icons'

export default function GroupCreate({
    handleCancel,
}: {
    handleCancel: () => void
}) {
    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!nombre || !descripcion) return

        setLoading(true)
        try {
            const res = await fetch('/api/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nombre, descripcion }),
            })

            if (!res.ok) throw new Error('Error creando grupo')

            setNombre('')
            setDescripcion('')
            alert('Grupo creado!')
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
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                className={styles.create__input}
            />
            <input
                type="text"
                placeholder="Ingrese Descripcion del Grupo"
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
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
                        setNombre('')
                        setDescripcion('')
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
