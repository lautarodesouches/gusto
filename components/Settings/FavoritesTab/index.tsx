'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Restaurant } from '@/types'
import { getFavoriteRestaurants } from '@/app/configuracion/actions'
import { ROUTES } from '@/routes'
import styles from './styles.module.css'

export default function FavoritesTab() {
    const router = useRouter()
    const [favorites, setFavorites] = useState<Restaurant[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadFavorites = async () => {
            const result = await getFavoriteRestaurants()
            if (result.success && result.data) {
                setFavorites(result.data)
            }
            setLoading(false)
        }
        loadFavorites()
    }, [])

    const getEstadoActual = (restaurant: Restaurant): { abierto: boolean; mensaje: string; color: string } => {
        if (!restaurant.esDeLaApp || !restaurant.horariosJson) {
            return { abierto: false, mensaje: 'Horario no disponible', color: '#888' }
        }
        
        try {
            const horarios = JSON.parse(restaurant.horariosJson)
            if (!Array.isArray(horarios)) return { abierto: false, mensaje: 'Horario no disponible', color: '#888' }
            
            const ahora = new Date()
            const diaActual = ahora.getDay()
            const horaActual = ahora.getHours()
            const minutoActual = ahora.getMinutes()
            const horaActualTotal = horaActual * 60 + minutoActual
            
            const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
            const diaActualNombre = diasSemana[diaActual]
            
            const horarioHoy = horarios.find((h: { dia: string }) => h.dia === diaActualNombre)
            
            if (!horarioHoy) {
                return { abierto: false, mensaje: 'Horario no disponible', color: '#888' }
            }
            
            if (horarioHoy.cerrado) {
                return { abierto: false, mensaje: 'Cerrado hoy', color: '#ff6b6b' }
            }
            
            const match = horarioHoy.desde && horarioHoy.hasta ? 
                `De ${horarioHoy.desde} a ${horarioHoy.hasta}`.match(/De (\d{1,2}):(\d{2}) a (\d{1,2}):(\d{2})/) : null
            
            if (!match) {
                return { abierto: true, mensaje: 'Abierto', color: '#4ade80' }
            }
            
            const horaApertura = parseInt(match[1], 10)
            const minutoApertura = parseInt(match[2], 10)
            const horaCierre = parseInt(match[3], 10)
            const minutoCierre = parseInt(match[4], 10)
            
            const horaAperturaTotal = horaApertura * 60 + minutoApertura
            const horaCierreTotal = horaCierre * 60 + minutoCierre
            
            if (horaActualTotal >= horaAperturaTotal && horaActualTotal < horaCierreTotal) {
                return { 
                    abierto: true, 
                    mensaje: `Abierto hasta las ${match[3]}:${match[4]}`, 
                    color: '#4ade80' 
                }
            } else if (horaActualTotal < horaAperturaTotal) {
                return { 
                    abierto: false, 
                    mensaje: `Abre a las ${match[1]}:${match[2]}`, 
                    color: '#fbbf24' 
                }
            } else {
                return { abierto: false, mensaje: 'Cerrado', color: '#ff6b6b' }
            }
        } catch (error) {
            console.error('Error parseando horarios:', error)
            return { abierto: false, mensaje: 'Horario no disponible', color: '#888' }
        }
    }

    const renderStars = (rating: number) => {
        const stars = []
        for (let i = 1; i <= 5; i++) {
            if (rating >= i) {
                stars.push(
                    <Image
                        key={i}
                        src="/images/all/star.svg"
                        alt=""
                        width={16}
                        height={16}
                        className={styles.star}
                    />
                )
            } else if (rating >= i - 0.5) {
                stars.push(
                    <Image
                        key={i}
                        src="/images/all/star-half.svg"
                        alt=""
                        width={16}
                        height={16}
                        className={styles.star}
                    />
                )
            } else {
                stars.push(
                    <Image
                        key={i}
                        src="/images/all/star-empty.svg"
                        alt=""
                        width={16}
                        height={16}
                        className={styles.star}
                    />
                )
            }
        }
        return stars
    }

    if (loading) {
        return <div className={styles.loading}>Cargando favoritos...</div>
    }

    if (favorites.length === 0) {
        return (
            <div className={styles.empty}>
                <p className={styles.emptyText}>No tienes restaurantes favoritos aún</p>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            {favorites.map((restaurant) => {
                const estado = getEstadoActual(restaurant)
                const rating = restaurant.rating ?? restaurant.valoracion ?? 0

                return (
                    <div
                        key={restaurant.id}
                        className={styles.card}
                        onClick={() => router.push(`${ROUTES.RESTAURANT}${restaurant.id}`)}
                    >
                        <div className={styles.logoContainer}>
                            <Image
                                src={restaurant.logoUrl || restaurant.imagenUrl || '/images/restaurant/logo.png'}
                                alt={restaurant.nombre}
                                width={80}
                                height={80}
                                className={styles.logo}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = '/images/restaurant/logo.png'
                                }}
                            />
                        </div>
                        <div className={styles.info}>
                            <h3 className={styles.name}>{restaurant.nombre}</h3>
                            <div className={styles.status} style={{ color: estado.color }}>
                                {estado.mensaje}
                            </div>
                            <div className={styles.rating}>
                                <span className={styles.ratingNumber}>
                                    {rating > 0 ? rating.toFixed(1) : 'N/A'}
                                </span>
                                <div className={styles.stars}>
                                    {renderStars(rating)}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
