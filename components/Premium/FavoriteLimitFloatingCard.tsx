'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createPayment } from '@/app/actions/payment'

interface FavoriteLimitFloatingCardProps {
    isOpen: boolean
    onClose: () => void
    onUpgrade?: () => void
    limitInfo?: {
        tipoPlan?: string
        limiteActual?: number
        favoritosActuales?: number
    }
}

export default function FavoriteLimitFloatingCard({
    isOpen,
    onClose,
    onUpgrade: _onUpgrade,
    limitInfo
}: FavoriteLimitFloatingCardProps) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

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

            const nombreCompleto = user.displayName || `${user.email.split('@')[0]}`

            const result = await createPayment({
                email: user.email,
                nombreCompleto,
            })

            if (result.success && result.data?.initPoint) {
                localStorage.setItem('pendingPayment', 'true')
                localStorage.setItem('paymentEmail', user.email)
                
                window.location.href = result.data.initPoint
            } else {
                setError(result.error || 'Error al procesar el pago')
            }
        } catch (error) {
            console.error('Error al crear pago:', error)
            setError('Error de conexión. Intenta nuevamente.')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    const currentFavorites = limitInfo?.favoritosActuales || 3
    const maxFavorites = limitInfo?.limiteActual || 3

    return (
        <div 
            style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                backdropFilter: 'blur(12px)',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            {/* Cartel flotante central */}
            <div 
                style={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                    borderRadius: '24px',
                    padding: '32px',
                    maxWidth: '500px',
                    width: '100%',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Botón cerrar */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '18px',
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                >
                    ×
                </button>

                {/* Título */}
                <h2 style={{
                    color: 'white',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    fontFamily: 'var(--font-gliker)',
                    textAlign: 'center',
                }}>
                    Límite Alcanzado
                </h2>

                {/* Mensaje */}
                <p style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '16px',
                    marginBottom: '24px',
                    textAlign: 'center',
                    fontFamily: 'var(--font-plus)',
                    lineHeight: '1.5',
                }}>
                    Has alcanzado el límite de {maxFavorites} restaurantes favoritos para usuarios del plan {limitInfo?.tipoPlan || 'Free'}.
                </p>

                {/* Contador de favoritos */}
                <div style={{
                    background: 'rgba(255, 80, 80, 0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '20px',
                    border: '1px solid rgba(255, 80, 80, 0.2)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                    }}>
                        <span style={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '14px',
                            fontFamily: 'var(--font-plus)',
                        }}>Tus favoritos</span>
                        <span style={{
                            color: '#ff5050',
                            fontSize: '22px',
                            fontWeight: 'bold',
                            fontFamily: 'var(--font-gliker)',
                        }}>{currentFavorites}/{maxFavorites}</span>
                    </div>
                    <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '999px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            height: '100%',
                            width: '100%',
                            background: 'linear-gradient(90deg, #ff5050 0%, #ff6b6b 100%)',
                            borderRadius: '999px',
                            transition: 'width 0.5s ease'
                        }}></div>
                    </div>
                </div>

                {/* Beneficios Premium */}
                <div style={{
                    background: 'rgba(0, 123, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '20px',
                    border: '1px solid rgba(0, 123, 255, 0.2)'
                }}>
                    <h3 style={{
                        color: '#007bff',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginBottom: '12px',
                        fontFamily: 'var(--font-gliker)',
                    }}>
                        🚀 Con Premium podrás:
                    </h3>
                    <ul style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '14px',
                        fontFamily: 'var(--font-plus)',
                    }}>
                        <li style={{ marginBottom: '8px', paddingLeft: '24px', position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 0 }}>✓</span>
                            Guardar restaurantes favoritos ilimitados
                        </li>
                        <li style={{ marginBottom: '8px', paddingLeft: '24px', position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 0 }}>✓</span>
                            Crear y unirte a grupos ilimitados
                        </li>
                        <li style={{ paddingLeft: '24px', position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 0 }}>✓</span>
                            Y mucho más próximamente
                        </li>
                    </ul>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: 'rgba(255, 80, 80, 0.2)',
                        border: '1px solid rgba(255, 80, 80, 0.4)',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '16px',
                        color: '#ff5050',
                        fontSize: '14px',
                        textAlign: 'center',
                    }}>
                        {error}
                    </div>
                )}

                {/* Botones */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '14px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontFamily: 'var(--font-plus)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleUpgrade}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '14px',
                            background: loading ? 'rgba(0, 123, 255, 0.5)' : 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            fontFamily: 'var(--font-gliker)',
                            boxShadow: loading ? 'none' : '0 4px 12px rgba(0, 123, 255, 0.4)',
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 123, 255, 0.5)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.4)'
                            }
                        }}
                    >
                        {loading ? 'Procesando...' : '💎 Hacerse Premium'}
                    </button>
                </div>
            </div>
        </div>
    )
}
