'use client'
import { useState } from 'react'
import styles from './page.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faX } from '@fortawesome/free-solid-svg-icons'
import UpgradePremiumModal from '@/components/Premium/UpgradePremiumModal'
import { createGroup } from '@/app/actions/groups'
import { useToast } from '@/context/ToastContext'

interface CreateGroupErrorResponse {
    error?: string
    needsPremium?: boolean
    tipoPlan?: string
    limiteActual?: number
    gruposActuales?: number
    beneficiosPremium?: string[]
}

export default function GroupCreate({
    handleCancel,
}: {
    handleCancel: () => void
}) {
    const toast = useToast()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [showLimitCard, setShowLimitCard] = useState(false)
    const [limitInfo, setLimitInfo] = useState<{
        tipoPlan: string
        limiteActual: number
        gruposActuales: number
    } | undefined>(undefined)

    const handleSubmit = async () => {
        if (!name || !description) return

        setLoading(true)

        try {
            const result = await createGroup({ name, description })

            if (!result.success) {
                // Verificar si es error de límite de grupos
                const errorData = result as CreateGroupErrorResponse
                if (
                    errorData.error === 'LIMITE_GRUPOS_ALCANZADO' ||
                    errorData.needsPremium ||
                    (errorData.error &&
                        (errorData.error.includes(
                            'Límite de grupos alcanzado'
                        ) ||
                            errorData.error.includes('límite')))
                ) {
                    setLimitInfo({
                        tipoPlan: errorData.tipoPlan || 'Free',
                        limiteActual: errorData.limiteActual || 0,
                        gruposActuales: errorData.gruposActuales || 0,
                    })
                    setShowLimitCard(true)
                    return
                }

                toast.error(result.error || 'Error creando grupo')
                return
            }

            toast.success(`Grupo "${name}" creado exitosamente`)
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('groups:refresh'))
            }

            setName('')
            setDescription('')
            handleCancel()
        } catch (err) {
            console.error('Error en handleSubmit:', err)
            toast.error('No se pudo crear grupo')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <aside className={styles.create}>
                <button
                    className={styles.create__close}
                    onClick={handleCancel}
                    aria-label="Cerrar"
                >
                    <FontAwesomeIcon icon={faX} />
                </button>
                <div className={styles.create__container}>
                    <FontAwesomeIcon
                        icon={faPen}
                        className={styles.create__icon}
                    />
                </div>
                <input
                    type="text"
                    placeholder="Nombre del grupo"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className={styles.create__input}
                />
                <input
                    type="text"
                    placeholder="Descripcion"
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
                        Crear
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

            {/* Cartel flotante para límite de grupos */}
            <UpgradePremiumModal
                isOpen={showLimitCard}
                onClose={() => {
                    setShowLimitCard(false)
                    setLimitInfo(undefined)
                }}
                trigger="group_limit"
                limitInfo={limitInfo}
            />
        </>
    )
}
