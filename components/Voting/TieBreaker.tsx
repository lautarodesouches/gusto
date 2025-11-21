'use client'

import { useState, useEffect } from 'react'
import { RestauranteVotado } from '@/types'
import styles from './TieBreaker.module.css'

interface TieBreakerProps {
    restaurantes: RestauranteVotado[]
    onGanador: (restauranteId: string) => void
}

export default function TieBreaker({ restaurantes, onGanador }: TieBreakerProps) {
    const [girando, setGirando] = useState(false)
    const [indiceActual, setIndiceActual] = useState(0)
    const [ganadorIndex, setGanadorIndex] = useState<number | null>(null)

    useEffect(() => {
        if (!girando) return

        const interval = setInterval(() => {
            setIndiceActual((prev) => (prev + 1) % restaurantes.length)
        }, 100)

        return () => clearInterval(interval)
    }, [girando, restaurantes.length])

    const girarRuleta = () => {
        setGirando(true)
        setGanadorIndex(null)

        const tiempoGiro = 3000 + Math.random() * 2000

        setTimeout(() => {
            setGirando(false)
            const indexGanador = Math.floor(Math.random() * restaurantes.length)
            setGanadorIndex(indexGanador)
            setIndiceActual(indexGanador)

            setTimeout(() => {
                onGanador(restaurantes[indexGanador].restauranteId)
            }, 2000)
        }, tiempoGiro)
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>🎰 Ruleta de Desempate</h2>
            <p className={styles.subtitle}>
                ¡Dejemos que la suerte decida!
            </p>

            <div className={styles.ruleta}>
                <div className={styles.ruletaInner}>
                    {restaurantes.map((restaurante, index) => (
                        <div
                            key={restaurante.restauranteId}
                            className={`${styles.opcion} ${
                                indiceActual === index ? styles.activo : ''
                            } ${
                                ganadorIndex === index ? styles.ganador : ''
                            }`}
                        >
                            <div className={styles.emoji}>
                                {ganadorIndex === index ? '🏆' : '🍽️'}
                            </div>
                            <div className={styles.nombre}>
                                {restaurante.restauranteNombre}
                            </div>
                            <div className={styles.direccion}>
                                {restaurante.restauranteDireccion}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {!girando && ganadorIndex === null && (
                <button onClick={girarRuleta} className={styles.btnGirar}>
                    🎲 Girar Ruleta
                </button>
            )}

            {girando && (
                <p className={styles.mensaje}>Girando...</p>
            )}

            {ganadorIndex !== null && (
                <div className={styles.resultado}>
                    <h3>🏆 ¡Ganador!</h3>
                    <p>{restaurantes[ganadorIndex].restauranteNombre}</p>
                </div>
            )}
        </div>
    )
}
