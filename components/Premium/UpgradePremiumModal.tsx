'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/context/AuthContext'
import styles from './PremiumModal.module.css'
import { createPayment } from '@/app/actions/payment'

interface UpgradePremiumModalProps {
    isOpen: boolean
    onClose: () => void
    trigger?: 'group_limit' | 'general'
    limitInfo?: {
        tipoPlan: string
        limiteActual: number
        gruposActuales: number
        beneficiosPremium?: unknown
    }
}

export default function UpgradePremiumModal({
    isOpen,
    onClose,
    trigger: _trigger = 'general',
    limitInfo: _limitInfo,
}: UpgradePremiumModalProps) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    // Cerrar modal con ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEsc)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleEsc)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    const handleUpgrade = async () => {
        if (!user?.email) {
            setError('No se encontró información del usuario')
            return
        }

        try {
            setLoading(true)
            setError('')

            const nombreCompleto =
                user.displayName || `${user.email.split('@')[0]}`

            const result = await createPayment({
                email: user.email,
                nombreCompleto,
            })

            if (result.success && result.data?.initPoint) {
                localStorage.setItem('pendingPayment', 'true')
                localStorage.setItem('paymentEmail', user.email)

                window.location.href = result.data.initPoint
            } else {
                setError(
                    result.error || 'Error al procesar el pago'
                )
            }
        } catch (error) {
            console.error('Error al crear pago:', error)
            setError('Error de conexión. Intenta nuevamente.')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen || !mounted) return null

    return createPortal(
        <div
            className={styles.backdrop}
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            {/* Modal con 2 columnas */}
            <div className={styles.modal}>
                {/* Botón cerrar para mobile */}
                <button
                    onClick={onClose}
                    className={styles.boton_cerrar_mobile}
                    title="Cerrar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                    </svg>
                </button>

                {/* Columna izquierda - Contenido */}
                <div className={styles.columna_contenido}>
                    {/* Título */}
                    <h2 className={styles.titulo}>
                        <span className={styles.titulo_blanco}>Ser</span> <span className={styles.titulo_premium}>Premium</span>
                    </h2>

                    {/* Subtítulo */}
                    <p className={styles.subtitulo}>
                        Desbloquea las siguientes funciones premium de GUSTO!
                    </p>

                    {/* Beneficio principal con SVG */}
                    <div className={styles.beneficio_principal}>
                        <img
                            src="/images/all/mas_grupos.svg"
                            alt="Grupos ilimitados"
                            className={styles.grupos_svg}
                        />
                        <div className={styles.beneficio_texto}>
                            <p>Poder <span className={styles.destacado}>CREAR</span> y <span className={styles.destacado}>UNIRTE</span> a más de <span className={styles.destacado_numero}>3 GRUPOS</span></p>
                        </div>
                    </div>

                    <div className={styles.beneficio_principal}>
                        <img
                            src="/images/all/mas_favoritos.svg"
                            alt="Grupos ilimitados"
                            className={styles.grupos_svg}
                        />
                        <div className={styles.beneficio_texto}>
                            <p>Poder <span className={styles.destacado}>GUARDAR</span> en favoritos más de <span className={styles.destacado_numero}>3 RESTAURANTES</span></p>
                        </div>
                    </div>

                    {/* Precio */}
                    <div className={styles.precio_contenedor}>
                        <div className={styles.precio}>
                            <span className={styles.precio_monto}>$50 ARS</span>
                            <span className={styles.precio_periodo}>por mes</span>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className={styles.error}>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Botón */}
                    <button
                        onClick={handleUpgrade}
                        disabled={loading}
                        className={styles.boton_pagar}
                    >
                        {loading ? (
                            <>
                                <div className={styles.spinner}></div>
                                Procesando...
                            </>
                        ) : (
                            <>
                                <img
                                    src="/images/all/mercado_pago.svg"
                                    alt="Mercado Pago"
                                    className={styles.icono_mercado_pago}
                                />
                                Continuar con Mercado Pago
                            </>
                        )}
                    </button>
                </div>

                {/* Columna derecha - Imagen */}
                <div className={styles.columna_imagen}>
                    {/* Botón cerrar en esquina superior derecha */}
                    <button
                        onClick={onClose}
                        className={styles.boton_cerrar}
                        title="Cerrar"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>

                    {/* Placeholder para imagen */}
                    <div className={styles.imagen_placeholder}>
                        <img
                            src="/images/all/premium.jpg"
                            alt="Beneficios"
                            className={styles.imagen}
                        />
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}
