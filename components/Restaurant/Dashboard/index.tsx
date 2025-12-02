'use client'

import { useState } from 'react'
import styles from './page.module.css'
import {
    RestauranteMetricasDashboard,
    Restaurant,
    Review
} from '@/types'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import DataView from './DataView'
import MetricsView from './MetricsView'
import { useRestaurantDashboard } from './useRestaurantDashboard'

type Props = {
    restaurant: Restaurant
    metrics: RestauranteMetricasDashboard | null
}

export default function RestaurantDashboard({ restaurant, metrics }: Props) {
    const { user, loading } = useCurrentUser()
    const isPremium = !!user?.esPremium
    const restaurantName = restaurant.nombre

    // Hook con la lógica del dashboard
    const {
        direccion,
        setDireccion,
        webUrl,
        setWebUrl,
        lat,
        lng,
        handleLocationSelect,
        gustos,
        restricciones,
        selectedTastes,
        selectedRestrictions,
        saveState,
        imagenDestacadaUrl,
        logoUrl,
        imagenesInteriorUrls,
        imagenesComidaUrls,
        imagenMenuUrl,
        imageState,
        initialSchedule,
        handleScheduleChange,
        handleSelectChange,
        handleSaveBasics,
        handleImageUpload,
        handleImageDelete,
        isImageLoading
    } = useRestaurantDashboard(restaurant)

    // --------------------
    // Métricas y Reseñas
    // --------------------
    const metricCards = metrics
        ? [
            {
                id: 'top3-individual',
                label: 'Top 3 individual',
                value: metrics.totalTop3Individual,
            },
            {
                id: 'top3-grupal',
                label: 'Top 3 grupal',
                value: metrics.totalTop3Grupo,
            },
            {
                id: 'visitas-perfil',
                label: 'Visitas al perfil',
                value: metrics.totalVisitasPerfil,
            },
            {
                id: 'favoritos-actual',
                label: 'En favoritos (actual)',
                value: metrics.totalFavoritosActual,
            },
            {
                id: 'favoritos-historico',
                label: 'Favoritos (histórico)',
                value: metrics.totalFavoritosHistorico,
            },
        ]
        : []


    const totalReviews =
        (restaurant.reviewsLocales?.length ?? 0) +
        (restaurant.reviewsGoogle?.length ?? 0)

    const localReviews = restaurant.reviewsLocales || []
    const googleReviews = restaurant.reviewsGoogle || []
    const allReviews: Review[] = [...localReviews, ...googleReviews]
    const displayedReviews = allReviews.slice(0, 5)

    const getReviewRating = (review: Review): number => {
        const base = review.rating ?? review.valoracion ?? 0
        const rounded = Math.round(base)
        return Math.max(0, Math.min(5, rounded))
    }

    const getReviewText = (review: Review): string => {
        return review.texto || review.opinion || ''
    }

    const getReviewDate = (review: Review): string => {
        return review.fecha || review.fechaCreacion || review.fechaVisita || ''
    }

    const getReviewImage = (review: Review): string | undefined => {
        if (review.foto) return review.foto
        if (review.images && review.images.length > 0) return review.images[0]


        const fotos = (review as { fotos?: unknown }).fotos
        if (Array.isArray(fotos) && fotos.length > 0) {
            const f0 = fotos[0]

            if (typeof f0 === 'string') return f0

            if (f0 && typeof f0 === 'object' && 'url' in f0) {
                const url = (f0 as { url?: unknown }).url
                if (typeof url === 'string') return url
            }
        }

        return undefined
    }

    // --------------------
    // View State
    // --------------------
    const [activeView, setActiveView] = useState<'data' | 'metrics'>('data')

    // Render

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                {/* Cabecera con nombre del restaurante */}
                <header className={styles.header}>
                    <h1 className={styles.restaurantName}>{restaurantName}</h1>
                </header>

                {/* Tabs */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeView === 'data' ? styles.tabActive : ''
                            }`}
                        onClick={() => setActiveView('data')}
                    >
                        Datos del Restaurante
                    </button>
                    <button
                        className={`${styles.tab} ${activeView === 'metrics' ? styles.tabActive : ''
                            }`}
                        onClick={() => setActiveView('metrics')}
                    >
                        Métricas
                    </button>
                </div>

                <section className={styles.content}>
                    {activeView === 'metrics' ? (
                        <MetricsView
                            loading={loading}
                            isPremium={isPremium}
                            metricCards={metricCards}
                            totalReviews={totalReviews}
                            displayedReviews={displayedReviews}
                            getReviewRating={getReviewRating}
                            getReviewText={getReviewText}
                            getReviewDate={getReviewDate}
                            getReviewImage={getReviewImage}
                        />
                    ) : (
                        <DataView
                            saveState={saveState}
                            handleSaveBasics={handleSaveBasics}
                            direccion={direccion}
                            setDireccion={setDireccion}
                            webUrl={webUrl}
                            setWebUrl={setWebUrl}
                            lat={lat}
                            lng={lng}
                            handleLocationSelect={handleLocationSelect}
                            gustos={gustos}
                            restricciones={restricciones}
                            selectedTastes={selectedTastes}
                            selectedRestrictions={selectedRestrictions}
                            handleSelectChange={handleSelectChange}
                            handleScheduleChange={handleScheduleChange}
                            initialSchedule={initialSchedule}
                            imageState={imageState}
                            imagenDestacadaUrl={imagenDestacadaUrl}
                            logoUrl={logoUrl}
                            imagenesInteriorUrls={imagenesInteriorUrls}
                            imagenesComidaUrls={imagenesComidaUrls}
                            imagenMenuUrl={imagenMenuUrl}
                            handleImageUpload={handleImageUpload}
                            handleImageDelete={handleImageDelete}
                            isImageLoading={isImageLoading}
                        />
                    )}
                </section>
            </div>
        </main>
    )
}
