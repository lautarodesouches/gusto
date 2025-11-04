'use client'
import { useState } from 'react'
import styles from './page.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/navigation'
import { PremiumLimitFloatingCard } from '@/components'
import { useAuth } from '@/context/AuthContext'

export default function GroupCreate({
    handleCancel,
}: {
    handleCancel: () => void
}) {
    const router = useRouter()
    const { user } = useAuth()

    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [loading, setLoading] = useState(false)
    const [showLimitCard, setShowLimitCard] = useState(false)
    const [limitInfo, setLimitInfo] = useState<any>(null)

    const handleSubmit = async () => {
        if (!nombre || !descripcion) return

        setLoading(true)
        try {
            const res = await fetch('/api/group', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nombre, descripcion }),
            })

            const data = await res.json()
            
            // Debug: Log para ver qué está devolviendo el backend
            console.log('Response status:', res.status)
            console.log('Response data:', data)

            if (!res.ok) {
                // Verificar si es error de límite de grupos (status 402 Payment Required o 400)
                if ((res.status === 402 || res.status === 400) && (
                    data.error === 'LIMITE_GRUPOS_ALCANZADO' || 
                    data.needsPremium || 
                    data.tipoPlan === 'Free' ||
                    (data.message && (data.message.includes('Límite de grupos alcanzado') || data.message.includes('límite'))) ||
                    (data.mensaje && (data.mensaje.includes('límite') || data.mensaje.includes('Límite')))
                )) {
                    console.log('Detectando límite de grupos, mostrando cartel flotante')
                    setLimitInfo({
                        tipoPlan: data.tipoPlan,
                        limiteActual: data.limiteActual,
                        gruposActuales: data.gruposActuales,
                        beneficiosPremium: data.beneficiosPremium
                    })
                    setShowLimitCard(true)
                    return
                }
                throw new Error(data.message || data.mensaje || 'Error creando grupo')
            }

            setNombre('')
            setDescripcion('')
            alert('Grupo creado!')
            handleCancel()
            router.refresh()
        } catch (err) {
            console.error('Error en handleSubmit:', err)
            alert('Hubo un error creando el grupo')
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
