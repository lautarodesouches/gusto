'use client'
import { useState } from 'react'
import styles from './page.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/navigation'
import { PremiumLimitFloatingCard } from '@/components'
import { useAuth } from '@/context/AuthContext'
import { createGroup } from '@/app/actions/groups'
import { useToast } from '@/context/ToastContext'

export default function GroupCreate({
    handleCancel,
}: {
    handleCancel: () => void
}) {
    const router = useRouter()
    const { user } = useAuth()
    const toast = useToast()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [showLimitCard, setShowLimitCard] = useState(false)
    const [limitInfo, setLimitInfo] = useState<any>(null)

    const handleSubmit = async () => {
        if (!name || !description) return

        setLoading(true)

        try {
            const result = await createGroup({ name, description })

            // Debug: Log para ver qué está devolviendo el backend
            console.log('Result:', result)

            if (!result.success) {
                // Verificar si es error de límite de grupos
                const errorData = result as any // Castear para acceder a campos adicionales
                if (errorData.error === 'LIMITE_GRUPOS_ALCANZADO' || 
                    errorData.needsPremium || 
                    (errorData.error && (errorData.error.includes('Límite de grupos alcanzado') || errorData.error.includes('límite')))
                ) {
                    console.log('Detectando límite de grupos, mostrando cartel flotante')
                    setLimitInfo({
                        tipoPlan: errorData.tipoPlan,
                        limiteActual: errorData.limiteActual,
                        gruposActuales: errorData.gruposActuales,
                        beneficiosPremium: errorData.beneficiosPremium
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

            {/* Cartel flotante para límite de grupos */}
            <PremiumLimitFloatingCard
                isOpen={showLimitCard}
                onClose={() => {
                    setShowLimitCard(false)
                    setLimitInfo(null)
                }}
                limitInfo={limitInfo}
            />
        </>
    )
}
