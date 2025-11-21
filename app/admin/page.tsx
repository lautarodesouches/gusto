'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ROUTES } from '@/routes'
import RequestCard from '@/components/Admin/RequestCard'
import { useToast } from '@/context/ToastContext'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import { SolicitudRestaurante, SolicitudStatus } from '@/types'
import type { SolicitudRestauranteBackend } from '@/types'
import RequestDetailModal from '@/components/Admin/RequestDetailModal'
import RejectModal from '@/components/Admin/RejectModal'



export default function AdminPanel() {
    const router = useRouter()
    const toast = useToast()
    const [solicitudes, setSolicitudes] = useState<SolicitudRestaurante[]>([])
    const [filteredSolicitudes, setFilteredSolicitudes] = useState<SolicitudRestaurante[]>([])
    const [activeFilter, setActiveFilter] = useState<SolicitudStatus>('Todos')
    const [isLoading, setIsLoading] = useState(true)
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [selectedSolicitudId, setSelectedSolicitudId] = useState<string | null>(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [rejectModalOpen, setRejectModalOpen] = useState(false)
    const [solicitudToReject, setSolicitudToReject] = useState<string | null>(null)

    // Función para cargar solicitudes según el filtro activo
    const loadSolicitudes = async (tipo?: SolicitudStatus) => {
        try {
            setIsLoading(true)
            const tipoFiltro = tipo || activeFilter
            
            // Si es 'Todos', usar el endpoint con 'Todas' que el backend soporta
            if (tipoFiltro === 'Todos') {
                const response = await fetch('/api/admin/solicitudes?tipo=Todas')
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}))
                    toast.error(errorData.error || 'Error al cargar solicitudes')
                    return
                }
                
                const data: SolicitudRestaurante[] = await response.json()
                // El backend ya devuelve el status mapeado en cada objeto
                const solicitudesConStatus: SolicitudRestaurante[] = Array.isArray(data) 
                    ? data.map((s: SolicitudRestaurante) => ({
                        ...s,
                        status: s.status || 'Pendiente' as SolicitudStatus,
                    }))
                    : []
                setSolicitudes(solicitudesConStatus)
                return
            }
            
            // Para un tipo específico, usar el endpoint con el tipo correspondiente
            // Mapear del frontend al backend: 'Aceptado' -> 'Aprobada', 'Rechazado' -> 'Rechazada'
            const tipoMap: Record<string, string> = {
                'Pendiente': 'Pendiente',
                'Aceptado': 'Aprobada',
                'Rechazado': 'Rechazada',
            }
            const tipoBackend = tipoMap[tipoFiltro] || tipoFiltro
            const response = await fetch(`/api/admin/solicitudes?tipo=${tipoBackend}`)
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                toast.error(errorData.error || 'Error al cargar solicitudes')
                return
            }
            
            const data: SolicitudRestaurante[] = await response.json()
            // Mapear el status según el tipo (usar los valores del frontend)
            const statusMap: Record<string, SolicitudStatus> = {
                'Pendiente': 'Pendiente',
                'Aprobada': 'Aceptado',  // Backend devuelve 'Aprobada', frontend usa 'Aceptado'
                'Rechazada': 'Rechazado', // Backend devuelve 'Rechazada', frontend usa 'Rechazado'
            }
            const status = statusMap[tipoBackend] || tipoFiltro as SolicitudStatus
            
            const solicitudesConStatus: SolicitudRestaurante[] = Array.isArray(data) 
                ? data.map((s: SolicitudRestaurante) => ({ ...s, status }))
                : []
            setSolicitudes(solicitudesConStatus)
        } catch (error) {
            console.error('Error al cargar solicitudes:', error)
            toast.error('Error al cargar solicitudes')
        } finally {
            setIsLoading(false)
        }
    }

    // Cargar solicitudes al montar y cuando cambia el filtro
    useEffect(() => {
        loadSolicitudes(activeFilter)
    }, [activeFilter])

    // Filtrar solicitudes según el filtro activo
    useEffect(() => {
        if (activeFilter === 'Todos') {
            setFilteredSolicitudes(solicitudes)
        } else {
            setFilteredSolicitudes(
                solicitudes.filter(s => s.status === activeFilter)
            )
        }
    }, [activeFilter, solicitudes])

    const handleAceptar = async (id: string) => {
        try {
            setLoadingId(id)
            const response = await fetch('/api/admin/aceptar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ solicitudId: id }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                toast.error(errorData.error || 'Error al aceptar la solicitud')
                return
            }

            // Actualizar el status localmente y refrescar
            setSolicitudes(prev =>
                prev.map(s =>
                    s.id === id ? { ...s, status: 'Aceptado' as SolicitudStatus } : s
                )
            )
            toast.success('Solicitud aceptada exitosamente')
            // Refrescar la lista después de un breve delay
            setTimeout(() => {
                loadSolicitudes(activeFilter)
            }, 500)
        } catch (error) {
            console.error('Error al aceptar solicitud:', error)
            toast.error('Error al aceptar la solicitud')
        } finally {
            setLoadingId(null)
        }
    }

    const handleRechazarClick = (id: string) => {
        setSolicitudToReject(id)
        setRejectModalOpen(true)
    }

    const handleConfirmRechazar = async (motivo: string) => {
        if (!solicitudToReject) return

        try {
            setLoadingId(solicitudToReject)
            const response = await fetch('/api/admin/rechazar', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    solicitudId: solicitudToReject,
                    motivoRechazo: motivo,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                toast.error(errorData.error || 'Error al rechazar la solicitud')
                setRejectModalOpen(false)
                setSolicitudToReject(null)
                return
            }

            // Actualizar el status localmente y refrescar
            setSolicitudes(prev =>
                prev.map(s =>
                    s.id === solicitudToReject ? { ...s, status: 'Rechazado' as SolicitudStatus } : s
                )
            )
            toast.success('Solicitud rechazada')
            setRejectModalOpen(false)
            setSolicitudToReject(null)
            
            // Refrescar la lista después de un breve delay
            setTimeout(() => {
                loadSolicitudes(activeFilter)
            }, 500)
        } catch (error) {
            console.error('Error al rechazar solicitud:', error)
            toast.error('Error al rechazar la solicitud')
        } finally {
            setLoadingId(null)
        }
    }

    const handleVerDetalles = (id: string) => {
        setSelectedSolicitudId(id)
        setIsDetailModalOpen(true)
    }

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false)
        setSelectedSolicitudId(null)
    }

    const handleDarBaja = async (id: string) => {
        // TODO: Implementar dar de baja
        console.log('Dar de baja:', id)
        toast.info('Función de dar de baja próximamente')
    }

    const handleRemover = async (id: string) => {
        // TODO: Implementar remover
        console.log('Remover:', id)
        toast.info('Función de remover próximamente')
    }

    const handleSalir = () => {
        router.push(ROUTES.HOME)
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.header__left}>
                    <Link href={ROUTES.HOME} className={styles.logo}>
                        <span className={styles.logo__text}>GUSTO!</span>
                        <span className={styles.logo__tagline}>
                            Decidir dónde comer, juntos
                        </span>
                    </Link>
                    <h1 className={styles.header__title}>Panel de Moderador</h1>
                </div>
                <button className={styles.header__button} onClick={handleSalir}>
                    Salir del Panel
                </button>
            </header>

            <main className={styles.main}>
                <div className={styles.titleSection}>
                    <h2 className={styles.title}>ADMINISTRAR SOLICITUDES</h2>
                    <div className={styles.title__underline}></div>
                </div>

                <div className={styles.filters}>
                    <button
                        className={`${styles.filter} ${
                            activeFilter === 'Todos' ? styles['filter--active'] : ''
                        }`}
                        onClick={() => setActiveFilter('Todos')}
                    >
                        Todos
                    </button>
                    <button
                        className={`${styles.filter} ${
                            activeFilter === 'Pendiente' ? styles['filter--active'] : ''
                        }`}
                        onClick={() => setActiveFilter('Pendiente')}
                    >
                        Pendiente
                    </button>
                    <button
                        className={`${styles.filter} ${
                            activeFilter === 'Aceptado' ? styles['filter--active'] : ''
                        }`}
                        onClick={() => setActiveFilter('Aceptado')}
                    >
                        Aceptados
                    </button>
                    <button
                        className={`${styles.filter} ${
                            activeFilter === 'Rechazado' ? styles['filter--active'] : ''
                        }`}
                        onClick={() => setActiveFilter('Rechazado')}
                    >
                        Rechazados
                    </button>
                </div>

                {isLoading ? (
                    <div className={styles.loading}>
                        <p>Cargando solicitudes...</p>
                    </div>
                ) : filteredSolicitudes.length === 0 ? (
                    <div className={styles.empty}>
                        <p>No hay solicitudes {activeFilter !== 'Todos' ? activeFilter.toLowerCase() : ''}</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {filteredSolicitudes.map(solicitud => (
                            <RequestCard
                                key={solicitud.id}
                                solicitud={solicitud}
                                onAceptar={handleAceptar}
                                onRechazar={handleRechazarClick}
                                onVerDetalles={handleVerDetalles}
                                onDarBaja={handleDarBaja}
                                onRemover={handleRemover}
                                isLoading={loadingId === solicitud.id}
                            />
                        ))}
                    </div>
                )}
            </main>

            {selectedSolicitudId && (
                <RequestDetailModal
                    solicitudId={selectedSolicitudId}
                    isOpen={isDetailModalOpen}
                    onClose={handleCloseDetailModal}
                />
            )}

            <RejectModal
                isOpen={rejectModalOpen}
                onClose={() => {
                    setRejectModalOpen(false)
                    setSolicitudToReject(null)
                }}
                onConfirm={handleConfirmRechazar}
                isLoading={loadingId === solicitudToReject}
            />
        </div>
    )
}

