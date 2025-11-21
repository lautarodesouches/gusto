'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'

interface PremiumLimitFloatingCardProps {
    isOpen: boolean
    onClose: () => void
    onUpgrade?: () => void
    limitInfo?: {
        tipoPlan?: string
        limiteActual?: number
        gruposActuales?: number
    }
}

export default function PremiumLimitFloatingCard({
    isOpen,
    onClose,
    onUpgrade: _onUpgrade,
    limitInfo
}: PremiumLimitFloatingCardProps) {
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

            const response = await fetch('/api/payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: user.email,
                    nombreCompleto
                }),
            })

            const data = await response.json()

            if (response.ok && data.initPoint) {
                localStorage.setItem('pendingPayment', 'true')
                localStorage.setItem('paymentEmail', user.email)
                
                window.location.href = data.initPoint
            } else {
                setError(data.message || data.error || 'Error al procesar el pago')
            }
        } catch (error) {
            console.error('Error al crear pago:', error)
            setError('Error de conexión. Intenta nuevamente.')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    const currentGroups = limitInfo?.gruposActuales || 3
    const maxGroups = limitInfo?.limiteActual || 3

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
                    position: 'relative',
                    backgroundColor: '#2d2d2b',
                    borderRadius: '24px',
                    maxWidth: '500px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 0 60px rgba(255, 80, 80, 0.6), 0 0 100px rgba(255, 80, 80, 0.4), 0 20px 40px rgba(0, 0, 0, 0.5)',
                    animation: 'floatIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    zIndex: 10000000,
                    border: '2px solid rgba(255, 80, 80, 0.3)'
                }}
            >
                {/* Botón cerrar - arriba a la derecha */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '32px',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        zIndex: 10,
                        fontFamily: 'var(--font-plus)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#fff'
                        e.currentTarget.style.backgroundColor = 'rgba(255, 80, 80, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
                        e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                >
                    ×
                </button>

                {/* Contenido centrado */}
                <div style={{ padding: '36px 24px 28px 24px', textAlign: 'center' }}>
                    
                    {/* Icono grande */}
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                        }}>
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(255, 80, 80, 0.3)',
                                borderRadius: '50%',
                                filter: 'blur(20px)',
                                animation: 'pulse 2s ease-in-out infinite'
                            }}></div>
                            <div style={{
                                position: 'relative',
                                width: '60px',
                                height: '60px',
                                background: 'linear-gradient(135deg, #ff5050 0%, #ff6b6b 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 10px 30px rgba(255, 80, 80, 0.4)',
                                fontSize: '30px'
                            }}>
                                🔒
                            </div>
                        </div>
                    </div>

                    {/* Título */}
                    <h2 style={{
                        color: '#fff',
                        fontSize: '26px',
                        fontWeight: 'bold',
                        marginBottom: '6px',
                        fontFamily: 'var(--font-gliker)',
                        letterSpacing: '-0.5px'
                    }}>
                        ¡Límite Alcanzado!
                    </h2>

                    {/* Subtítulo */}
                    <p style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '15px',
                        marginBottom: '20px',
                        fontFamily: 'var(--font-plus)',
                    }}>
                        Llegaste al máximo de grupos gratuitos
                    </p>

                    {/* Contador de grupos */}
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
                            }}>Tus grupos</span>
                            <span style={{
                                color: '#ff5050',
                                fontSize: '22px',
                                fontWeight: 'bold',
                                fontFamily: 'var(--font-gliker)',
                            }}>{currentGroups}/{maxGroups}</span>
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

                    {/* Mensaje principal - más compacto */}
                    <p style={{
                        color: '#fff',
                        fontSize: '16px',
                        marginBottom: '16px',
                        fontFamily: 'var(--font-plus)',
                    }}>
                        Actualiza a <span style={{ 
                            color: '#ff5050', 
                            fontWeight: 'bold',
                            fontFamily: 'var(--font-gliker)',
                        }}>Premium</span> para crear grupos ilimitados ✨
                    </p>

                    {/* Beneficios rápidos - más compactos */}
                    <div style={{ marginBottom: '16px', display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {[
                            { icon: '🚀', text: 'Grupos ilimitados' },
                            { icon: '🎯', text: 'IA avanzada' },
                            { icon: '💎', text: 'Sin anuncios' }
                        ].map((benefit, index) => (
                            <div 
                                key={index}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '8px',
                                    padding: '6px 10px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'default'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 80, 80, 0.1)'
                                    e.currentTarget.style.borderColor = 'rgba(255, 80, 80, 0.3)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                                }}
                            >
                                <span style={{ fontSize: '16px' }}>{benefit.icon}</span>
                                <span style={{
                                    color: '#fff',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    fontFamily: 'var(--font-plus)',
                                }}>{benefit.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Precio - más compacto */}
                    <div style={{
                        background: 'linear-gradient(135deg, #ff5050 0%, #ff6b6b 100%)',
                        borderRadius: '12px',
                        padding: '14px',
                        marginBottom: '20px',
                        boxShadow: '0 10px 30px rgba(255, 80, 80, 0.3)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: '12px',
                            fontWeight: '500',
                            marginBottom: '2px',
                            fontFamily: 'var(--font-plus)',
                        }}>Solo</div>
                        <div style={{
                            color: '#fff',
                            fontSize: '32px',
                            fontWeight: 'bold',
                            lineHeight: '1',
                            marginBottom: '2px',
                            fontFamily: 'var(--font-gliker)',
                        }}>$50 <span style={{ fontSize: '18px' }}>ARS</span></div>
                        <div style={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: '12px',
                            fontFamily: 'var(--font-plus)',
                        }}>Pago único · Acceso de por vida</div>
                    </div>

                    {/* Botones */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {error && (
                            <div style={{
                                padding: '12px',
                                background: 'rgba(255, 80, 80, 0.1)',
                                border: '1px solid rgba(255, 80, 80, 0.3)',
                                borderRadius: '8px',
                                color: '#ff5050',
                                fontSize: '14px',
                                fontFamily: 'var(--font-plus)',
                                textAlign: 'center',
                                marginBottom: '8px'
                            }}>
                                {error}
                            </div>
                        )}
                        <button
                            onClick={handleUpgrade}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: loading ? 'rgba(255, 80, 80, 0.5)' : 'linear-gradient(135deg, #ff5050 0%, #ff6b6b 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(255, 80, 80, 0.4)',
                                fontFamily: 'var(--font-gliker)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                    e.currentTarget.style.boxShadow = '0 6px 25px rgba(255, 80, 80, 0.5)'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 80, 80, 0.4)'
                                }
                            }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                {loading ? (
                                    <>
                                        <span style={{ 
                                            display: 'inline-block',
                                            width: '16px',
                                            height: '16px',
                                            border: '2px solid rgba(255, 255, 255, 0.3)',
                                            borderTopColor: '#fff',
                                            borderRadius: '50%',
                                            animation: 'spin 0.8s linear infinite'
                                        }}></span>
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <span>⭐</span>
                                        Actualizar a Premium
                                    </>
                                )}
                            </span>
                        </button>

                        <button
                            onClick={onClose}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'transparent',
                                color: 'rgba(255, 255, 255, 0.6)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                fontFamily: 'var(--font-plus)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#fff'
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                                e.currentTarget.style.background = 'transparent'
                            }}
                        >
                            Ahora no
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes floatIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.8) translateY(40px);
                    }
                    60% {
                        transform: scale(1.02) translateY(-5px);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    )
}
