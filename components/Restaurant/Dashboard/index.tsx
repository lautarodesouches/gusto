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
        ]
        : []

    const totalReviews =
        (restaurant.reviewsLocales?.length ?? 0) +
        (restaurant.reviewsGoogle?.length ?? 0)

    const localReviews = restaurant.reviewsLocales || []
    const googleReviews = restaurant.reviewsGoogle || []
    const allReviews: Review[] = [...localReviews, ...googleReviews]
    const displayedReviews = allReviews.slice(0, 5)

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
                            localReviewIds={new Set(localReviews.map(r => r.id))}
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
