'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'
import {
    RestauranteMetricasDashboard,
    Restaurant,
    RegisterItem,
    Review
} from '@/types'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import {
    RestaurantTimeTable,
    RestaurantSelect,
    RestaurantMap,
} from '@/components/CreateRestaurant'
import type { ScheduleState } from '@/components/CreateRestaurant/TimeTable'

type Props = {
    restaurant: Restaurant
    metrics: RestauranteMetricasDashboard | null
}

type SaveState = {
    loading: boolean
    error: string
    success: string
}

type ImageSaveState = {
    loadingType: 'destacada' | 'logo' | 'interior' | 'comidas' | 'menu' | null
    error: string
    success: string
}

type ImageType = 'destacada' | 'logo' | 'interior' | 'comidas' | 'menu'

export default function RestaurantDashboard({ restaurant, metrics }: Props) {
    const { user, loading } = useCurrentUser()

    const isPremium = !!user?.esPremium
    const restaurantName = restaurant.nombre

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

        const anyReview = review as any
        const fotos = anyReview.fotos as any[] | undefined
        if (Array.isArray(fotos) && fotos.length > 0) {
            const f0 = fotos[0]
            if (typeof f0 === 'string') return f0
            if (f0 && typeof f0 === 'object' && 'url' in f0 && f0.url) {
                return f0.url as string
            }
        }

        return undefined
    }



    // --------------------
    // Estado edición básica
    // --------------------
    const [direccion, setDireccion] = useState(restaurant.direccion ?? '')
    const [webUrl, setWebUrl] = useState(restaurant.webUrl ?? '')
    const [lat, setLat] = useState<number>(restaurant.latitud ?? 0)
    const [lng, setLng] = useState<number>(restaurant.longitud ?? 0)

    const [schedule, setSchedule] = useState<ScheduleState | null>(null)

        const handleLocationSelect = (
        newLat: number,
        newLng: number,
        addressFromMap: string
    ) => {
        const latNum = Number(newLat)
        const lngNum = Number(newLng)

        if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
            return
        }

        if (latNum < -90 || latNum > 90) {
            return
        }

        if (lngNum < -180 || lngNum > 180) {
            return
        }

        const latRounded = Math.round(latNum * 10000000) / 10000000
        const lngRounded = Math.round(lngNum * 10000000) / 10000000

        setLat(latRounded)
        setLng(lngRounded)

        if (addressFromMap) {
            setDireccion(addressFromMap)
        }
    }


    // Gustos / restricciones
    const [gustos, setGustos] = useState<RegisterItem[]>([])
    const [restricciones, setRestricciones] = useState<RegisterItem[]>([])
    const [selectedTastes, setSelectedTastes] = useState<string[]>(
        restaurant.gustosQueSirve?.map(g => g.nombre) ?? []
    )
    const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>(
        restaurant.restriccionesQueRespeta?.map(r => r.nombre) ?? []
    )

    const [saveState, setSaveState] = useState<SaveState>({
        loading: false,
        error: '',
        success: '',
    })

    // --------------------
    // Estado de imágenes (UI)
    // --------------------
    const [imagenDestacadaUrl, setImagenDestacadaUrl] = useState<
        string | null | undefined
    >(restaurant.imagenDestacada ?? null)

    const [logoUrl, setLogoUrl] = useState<string | null | undefined>(
        restaurant.logoUrl ?? null
    )

    const [imagenesInteriorUrls, setImagenesInteriorUrls] = useState<string[]>(
        restaurant.imagenesInterior ?? []
    )

    const [imagenesComidaUrls, setImagenesComidaUrls] = useState<string[]>(
        restaurant.imagenesComida ?? []
    )

    // De momento el DTO no trae imagen de menú, lo manejamos solo en memoria
    const [imagenMenuUrl, setImagenMenuUrl] = useState<string | null>(null)

    const [imageState, setImageState] = useState<ImageSaveState>({
        loadingType: null,
        error: '',
        success: '',
    })

    // --------------------
    // Horarios iniciales a partir de horariosJson
    // --------------------
    const initialSchedule: ScheduleState | null = (() => {
        try {
            const raw = restaurant.horariosJson
            if (!raw) return null

            const parsed = JSON.parse(raw)
            if (!Array.isArray(parsed)) return null

            const reverseDayMap: Record<string, string> = {
                Lunes: 'lunes',
                Martes: 'martes',
                Miércoles: 'miercoles',
                Jueves: 'jueves',
                Viernes: 'viernes',
                Sábado: 'sabado',
                Domingo: 'domingo',
            }

            const base: ScheduleState = {
                lunes: { from: '12:00', to: '22:00', locked: false },
                martes: { from: '12:00', to: '22:00', locked: false },
                miercoles: { from: '12:00', to: '22:00', locked: false },
                jueves: { from: '12:00', to: '22:00', locked: false },
                viernes: { from: '12:00', to: '22:00', locked: false },
                sabado: { from: '12:00', to: '22:00', locked: false },
                domingo: { from: '12:00', to: '22:00', locked: false },
            }

            for (const item of parsed as any[]) {
                const diaRaw = item.dia as string | undefined
                if (!diaRaw) continue

                const key =
                    reverseDayMap[diaRaw] || diaRaw.toLowerCase() || null
                if (!key || !base[key]) continue

                const cerrado = !!item.cerrado
                const desde = (item.desde as string | undefined) ?? '12:00'
                const hasta = (item.hasta as string | undefined) ?? '22:00'

                base[key] = {
                    from: desde,
                    to: hasta,
                    locked: cerrado,
                }
            }

            return base
        } catch {
            return null
        }
    })()

    // Si cambia el restaurante (por las dudas)
    useEffect(() => {
        setDireccion(restaurant.direccion ?? '')
        setWebUrl(restaurant.webUrl ?? '')
        setLat(restaurant.latitud ?? 0)
        setLng(restaurant.longitud ?? 0)
        setSelectedTastes(
            restaurant.gustosQueSirve?.map(g => g.nombre) ?? []
        )
        setSelectedRestrictions(
            restaurant.restriccionesQueRespeta?.map(r => r.nombre) ?? []
        )
        setImagenDestacadaUrl(restaurant.imagenDestacada ?? null)
        setLogoUrl(restaurant.logoUrl ?? null)
        setImagenesInteriorUrls(restaurant.imagenesInterior ?? [])
        setImagenesComidaUrls(restaurant.imagenesComida ?? [])
    }, [restaurant])

    // Cargar catálogo de gustos y restricciones (como en restaurante/agregar)
    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch('/api/restaurante/datos')

                if (!response.ok) {
                    return
                }

                const data = await response.json()

                if (data.gustos && Array.isArray(data.gustos)) {
                    setGustos(data.gustos as RegisterItem[])
                }

                if (data.restricciones && Array.isArray(data.restricciones)) {
                    setRestricciones(data.restricciones as RegisterItem[])
                }
            } catch {
                // error silencioso, igual que en restaurante/agregar
            }
        }

        loadData()
    }, [])

    // --------------------
    // Handlers UI básicos
    // --------------------
    const handleScheduleChange = (value: ScheduleState) => {
        setSchedule(value)
    }

    const handleSelectChange = (name: string, value: string[]) => {
        if (name === 'tastes') {
            setSelectedTastes(value)
        } else if (name === 'restrictions') {
            setSelectedRestrictions(value)
        }
    }

    // --------------------
    // Guardar cambios básicos (datos, gustos, restricciones, horarios)
    // --------------------
    const handleSaveBasics = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaveState({ loading: true, error: '', success: '' })

        try {
            if (!direccion.trim()) {
                setSaveState({
                    loading: false,
                    error: 'La dirección es obligatoria',
                    success: '',
                })
                return
            }

            const payload: any = {
                direccion: direccion.trim(),
                lat,
                lng,
            }

            // Web URL
            if (webUrl !== (restaurant.webUrl ?? '')) {
                payload.webUrl = webUrl.trim() || null
            }

            // Horarios
            if (schedule) {
                const dayMap: Record<string, string> = {
                    lunes: 'Lunes',
                    martes: 'Martes',
                    miercoles: 'Miércoles',
                    jueves: 'Jueves',
                    viernes: 'Viernes',
                    sabado: 'Sábado',
                    domingo: 'Domingo',
                }

                const horariosArray = Object.entries(schedule).map(
                    ([key, value]) => ({
                        dia: dayMap[key] || key,
                        cerrado: value.locked,
                        ...(value.locked
                            ? {}
                            : { desde: value.from, hasta: value.to }),
                    })
                )

                payload.horariosJson = JSON.stringify(horariosArray)
            }

            // Gustos
            if (gustos.length > 0) {
                const gustosIds = selectedTastes
                    .map(nombre =>
                        gustos.find(
                            g =>
                                g.nombre.toLowerCase() ===
                                nombre.toLowerCase()
                        )?.id ?? null
                    )
                    .filter((id): id is string => !!id)

                payload.gustosQueSirveIds = gustosIds
            }

            // Restricciones
            if (restricciones.length > 0) {
                const restriccionesIds = selectedRestrictions
                    .map(nombre =>
                        restricciones.find(
                            r =>
                                r.nombre.toLowerCase() ===
                                nombre.toLowerCase()
                        )?.id ?? null
                    )
                    .filter((id): id is string => !!id)

                payload.restriccionesQueRespetaIds = restriccionesIds
            }

            const res = await fetch(`/api/restaurante/${restaurant.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                let errorMessage = 'Error al guardar cambios del restaurante'

                try {
                    const data = await res.json()
                    errorMessage =
                        data.error ||
                        data.message ||
                        `Error ${res.status}: ${res.statusText}`
                } catch {
                    const text = await res.text().catch(() => '')
                    if (text) errorMessage = text
                }

                setSaveState({
                    loading: false,
                    error: errorMessage,
                    success: '',
                })
                return
            }

            setSaveState({
                loading: false,
                error: '',
                success: 'Cambios guardados correctamente',
            })
        } catch (error) {
            console.error('❌ Error al guardar restaurante:', error)
            setSaveState({
                loading: false,
                error: 'Error inesperado al guardar los cambios',
                success: '',
            })
        }
    }

    // --------------------
    // Handlers imágenes
    // --------------------
    const handleImageUpload = async (
        tipo: ImageType,
        files: FileList | null
    ) => {
        if (!files || files.length === 0) return

        setImageState({
            loadingType: tipo,
            error: '',
            success: '',
        })

        try {
            const formData = new FormData()

            if (tipo === 'destacada' || tipo === 'logo' || tipo === 'menu') {
                formData.append('archivo', files[0])
            } else {
                Array.from(files).forEach(file => {
                    formData.append('archivos', file)
                })
            }

            const res = await fetch(
                `/api/restaurante/${restaurant.id}/imagenes/${tipo}`,
                {
                    method: 'PUT',
                    body: formData,
                }
            )

            if (!res.ok) {
                let errorMessage = 'Error al actualizar imagen'

                try {
                    const data = await res.json()
                    errorMessage =
                        data.error ||
                        data.message ||
                        `Error ${res.status}: ${res.statusText}`
                } catch {
                    const text = await res.text().catch(() => '')
                    if (text) errorMessage = text
                }

                setImageState({
                    loadingType: null,
                    error: errorMessage,
                    success: '',
                })
                return
            }

            const data = await res.json()

            if (tipo === 'destacada') {
                setImagenDestacadaUrl(data.imagenDestacada ?? null)
            } else if (tipo === 'logo') {
                setLogoUrl(data.logoUrl ?? null)
            } else if (tipo === 'interior') {
                setImagenesInteriorUrls(data.imagenesInterior ?? [])
            } else if (tipo === 'comidas') {
                setImagenesComidaUrls(data.imagenesComida ?? [])
            } else if (tipo === 'menu') {
                setImagenMenuUrl(data.imagenMenu ?? null)
            }

            setImageState({
                loadingType: null,
                error: '',
                success: 'Imagen/es actualizada/s correctamente',
            })
        } catch (error) {
            console.error('❌ Error al actualizar imagen:', error)
            setImageState({
                loadingType: null,
                error: 'Error inesperado al actualizar la imagen',
                success: '',
            })
        }
    }

    const handleImageDelete = async (tipo: ImageType) => {
        setImageState({
            loadingType: tipo,
            error: '',
            success: '',
        })

        try {
            const formData = new FormData()
            formData.append('soloBorrar', 'true')

            const res = await fetch(
                `/api/restaurante/${restaurant.id}/imagenes/${tipo}`,
                {
                    method: 'PUT',
                    body: formData,
                }
            )

            if (!res.ok) {
                let errorMessage = 'Error al borrar imagen'

                try {
                    const data = await res.json()
                    errorMessage =
                        data.error ||
                        data.message ||
                        `Error ${res.status}: ${res.statusText}`
                } catch {
                    const text = await res.text().catch(() => '')
                    if (text) errorMessage = text
                }

                setImageState({
                    loadingType: null,
                    error: errorMessage,
                    success: '',
                })
                return
            }

            const data = await res.json()

            if (tipo === 'destacada') {
                setImagenDestacadaUrl(data.imagenDestacada ?? null)
            } else if (tipo === 'logo') {
                setLogoUrl(data.logoUrl ?? null)
            } else if (tipo === 'interior') {
                setImagenesInteriorUrls(data.imagenesInterior ?? [])
            } else if (tipo === 'comidas') {
                setImagenesComidaUrls(data.imagenesComida ?? [])
            } else if (tipo === 'menu') {
                setImagenMenuUrl(data.imagenMenu ?? null)
            }

            setImageState({
                loadingType: null,
                error: '',
                success: 'Imagen/es borrada/s correctamente',
            })
        } catch (error) {
            console.error('❌ Error al borrar imagen:', error)
            setImageState({
                loadingType: null,
                error: 'Error inesperado al borrar la imagen',
                success: '',
            })
        }
    }

    const isImageLoading = (tipo: ImageType) =>
        imageState.loadingType === tipo


    // Render

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                {/* Cabecera con nombre del restaurante */}
                <header className={styles.header}>
                    <h1 className={styles.restaurantName}>{restaurantName}</h1>
                    { }
                </header>

                <section className={styles.content}>
                    {/* panel izquierdo: métricas + panel info */}
                    <div className={styles.leftPanel}>
                        {/* metricas / Premium */}
                        <section className={styles.metricsCard}>
                            {loading ? (
                                <div className={styles.metricsLoading}>
                                    Cargando métricas...
                                </div>
                            ) : !isPremium ? (
                                <div className={styles.metricsLocked}>
                                    <p>PARA VER MÉTRICAS</p>
                                    <p>
                                        DESBLOQUEA EL{' '}
                                        <span className={styles.highlight}>
                                            PREMIUM
                                        </span>
                                    </p>
                                </div>
                            ) : (
                                <div className={styles.metricsGrid}>
                                    {metricCards.map(card => (
                                        <article
                                            key={card.id}
                                            className={styles.metricCard}
                                        >
                                            <h3
                                                className={
                                                    styles.metricTitle
                                                }
                                            >
                                                {card.label}
                                            </h3>
                                            <div
                                                className={
                                                    styles
                                                        .metricCircleWrapper
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.metricCircle
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            styles.metricValue
                                                        }
                                                    >
                                                        {card.value}
                                                    </span>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Panel de información editable + imágenes */}
                        <section className={styles.infoPanel}>
                            <div className={styles.infoHeader}>
                                <h2>PANEL DE INFORMACIÓN</h2>
                                <button
                                    className={styles.saveButton}
                                    type="submit"
                                    form="restaurant-info-form"
                                    disabled={saveState.loading}
                                >
                                    {saveState.loading
                                        ? 'Guardando...'
                                        : 'Guardar cambios'}
                                </button>
                            </div>

                            <div className={styles.infoContent}>
                                <form
                                    id="restaurant-info-form"
                                    className={styles.infoForm}
                                    onSubmit={handleSaveBasics}
                                >
                                    {saveState.error && (
                                        <p className={styles.infoError}>
                                            {saveState.error}
                                        </p>
                                    )}
                                    {saveState.success && (
                                        <p className={styles.infoSuccess}>
                                            {saveState.success}
                                        </p>
                                    )}

                                    <div className={styles.infoRow}>
                                        <label
                                            className={styles.infoLabel}
                                            htmlFor="direccion"
                                        >
                                            Dirección
                                        </label>
                                        <input
                                            id="direccion"
                                            type="text"
                                            className={styles.infoInput}
                                            value={direccion}
                                            onChange={e =>
                                                setDireccion(e.target.value)
                                            }
                                            placeholder="Dirección del restaurante"
                                        />
                                    </div>

                                    <div className={styles.infoRow}>
                                        <label
                                            className={styles.infoLabel}
                                            htmlFor="webUrl"
                                        >
                                            Sitio web
                                        </label>
                                        <input
                                            id="webUrl"
                                            type="url"
                                            className={styles.infoInput}
                                            value={webUrl}
                                            onChange={e =>
                                                setWebUrl(e.target.value)
                                            }
                                            placeholder="https://..."
                                        />
                                    </div>

                                                                        <div className={styles.infoRowGrid}>
                                        <div>
                                            <label
                                                className={styles.infoLabel}
                                                htmlFor="lat"
                                            >
                                                Latitud
                                            </label>
                                            <input
                                                id="lat"
                                                type="number"
                                                step="0.000001"
                                                className={styles.infoInput}
                                                value={lat}
                                                readOnly
                                                disabled
                                            />
                                        </div>
                                        <div>
                                            <label
                                                className={styles.infoLabel}
                                                htmlFor="lng"
                                            >
                                                Longitud
                                            </label>
                                            <input
                                                id="lng"
                                                type="number"
                                                step="0.000001"
                                                className={styles.infoInput}
                                                value={lng}
                                                readOnly
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.infoRow}>
                                        <label className={styles.infoLabel}>
                                            Ubicación en el mapa
                                        </label>
                                        <div className={styles.mapWrapper}>
                                            <RestaurantMap
                                                address={direccion}
                                                onLocationSelect={
                                                    handleLocationSelect
                                                }
                                            />
                                        </div>
                                    </div>


                                    {/* Gustos y restricciones */}
                                    <div className={styles.infoRow}>
                                        <label className={styles.infoLabel}>
                                            Gustos y restricciones
                                        </label>
                                        <div
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns:
                                                    'repeat(2, minmax(0, 1fr))',
                                                gap: '10px',
                                            }}
                                        >
                                            <RestaurantSelect
                                                name="tastes"
                                                placeholder="Gustos que ofrece"
                                                options={gustos.map(
                                                    g => g.nombre
                                                )}
                                                value={selectedTastes}
                                                onChange={handleSelectChange}
                                                multiple
                                            />
                                            <RestaurantSelect
                                                name="restrictions"
                                                placeholder="Restricciones que respeta"
                                                options={restricciones.map(
                                                    r => r.nombre
                                                )}
                                                value={selectedRestrictions}
                                                onChange={handleSelectChange}
                                                multiple
                                            />
                                        </div>
                                    </div>

                                    {/* Horarios */}
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>
                                            Horarios
                                        </span>
                                        <RestaurantTimeTable
                                            onScheduleChange={
                                                handleScheduleChange
                                            }
                                            initialSchedule={
                                                initialSchedule || undefined
                                            }
                                        />
                                    </div>

                                    {/* Divider visual */}
                                    <div className={styles.infoDivider} />

                                    {/* Imágenes */}
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>
                                            Imágenes
                                        </span>

                                        {imageState.error && (
                                            <p
                                                className={
                                                    styles.imageErrorMessage
                                                }
                                            >
                                                {imageState.error}
                                            </p>
                                        )}
                                        {imageState.success && (
                                            <p
                                                className={
                                                    styles.imageSuccessMessage
                                                }
                                            >
                                                {imageState.success}
                                            </p>
                                        )}

                                        <div className={styles.imagesGrid}>
                                            {/* Imagen destacada */}
                                            <div className={styles.imageGroup}>
                                                <p
                                                    className={
                                                        styles.imageTitle
                                                    }
                                                >
                                                    Imagen destacada
                                                </p>
                                                {imagenDestacadaUrl ? (
                                                    <img
                                                        src={
                                                            imagenDestacadaUrl
                                                        }
                                                        alt="Imagen destacada"
                                                        className={
                                                            styles.imagePreview
                                                        }
                                                    />
                                                ) : (
                                                    <p
                                                        className={
                                                            styles.imageEmpty
                                                        }
                                                    >
                                                        Sin imagen
                                                    </p>
                                                )}
                                                <div
                                                    className={
                                                        styles.imageActions
                                                    }
                                                >
                                                    <label
                                                        className={
                                                            styles.imageButton
                                                        }
                                                    >
                                                        {isImageLoading(
                                                            'destacada'
                                                        )
                                                            ? 'Subiendo...'
                                                            : 'Cambiar'}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className={
                                                                styles.imageFileInput
                                                            }
                                                            onChange={e =>
                                                                handleImageUpload(
                                                                    'destacada',
                                                                    e.target
                                                                        .files
                                                                )
                                                            }
                                                            disabled={isImageLoading(
                                                                'destacada'
                                                            )}
                                                        />
                                                    </label>
                                                    <button
                                                        type="button"
                                                        className={
                                                            styles.imageButtonSecondary
                                                        }
                                                        onClick={() =>
                                                            handleImageDelete(
                                                                'destacada'
                                                            )
                                                        }
                                                        disabled={isImageLoading(
                                                            'destacada'
                                                        )}
                                                    >
                                                        Borrar
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Logo */}
                                            <div className={styles.imageGroup}>
                                                <p
                                                    className={
                                                        styles.imageTitle
                                                    }
                                                >
                                                    Logo
                                                </p>
                                                {logoUrl ? (
                                                    <img
                                                        src={logoUrl}
                                                        alt="Logo"
                                                        className={
                                                            styles.imagePreview
                                                        }
                                                    />
                                                ) : (
                                                    <p
                                                        className={
                                                            styles.imageEmpty
                                                        }
                                                    >
                                                        Sin logo
                                                    </p>
                                                )}
                                                <div
                                                    className={
                                                        styles.imageActions
                                                    }
                                                >
                                                    <label
                                                        className={
                                                            styles.imageButton
                                                        }
                                                    >
                                                        {isImageLoading(
                                                            'logo'
                                                        )
                                                            ? 'Subiendo...'
                                                            : 'Cambiar'}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className={
                                                                styles.imageFileInput
                                                            }
                                                            onChange={e =>
                                                                handleImageUpload(
                                                                    'logo',
                                                                    e.target
                                                                        .files
                                                                )
                                                            }
                                                            disabled={isImageLoading(
                                                                'logo'
                                                            )}
                                                        />
                                                    </label>
                                                    <button
                                                        type="button"
                                                        className={
                                                            styles.imageButtonSecondary
                                                        }
                                                        onClick={() =>
                                                            handleImageDelete(
                                                                'logo'
                                                            )
                                                        }
                                                        disabled={isImageLoading(
                                                            'logo'
                                                        )}
                                                    >
                                                        Borrar
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Interior */}
                                            <div className={styles.imageGroup}>
                                                <p
                                                    className={
                                                        styles.imageTitle
                                                    }
                                                >
                                                    Interior
                                                </p>
                                                {imagenesInteriorUrls &&
                                                    imagenesInteriorUrls.length >
                                                    0 ? (
                                                    <div
                                                        className={
                                                            styles.imageMultiPreview
                                                        }
                                                    >
                                                        {imagenesInteriorUrls.map(
                                                            (url, idx) => (
                                                                <img
                                                                    key={
                                                                        url +
                                                                        idx
                                                                    }
                                                                    src={url}
                                                                    alt={`Interior ${idx +
                                                                        1}`}
                                                                    className={
                                                                        styles.imagePreviewSmall
                                                                    }
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p
                                                        className={
                                                            styles.imageEmpty
                                                        }
                                                    >
                                                        Sin imágenes
                                                    </p>
                                                )}
                                                <div
                                                    className={
                                                        styles.imageActions
                                                    }
                                                >
                                                    <label
                                                        className={
                                                            styles.imageButton
                                                        }
                                                    >
                                                        {isImageLoading(
                                                            'interior'
                                                        )
                                                            ? 'Subiendo...'
                                                            : 'Reemplazar'}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            className={
                                                                styles.imageFileInput
                                                            }
                                                            onChange={e =>
                                                                handleImageUpload(
                                                                    'interior',
                                                                    e.target
                                                                        .files
                                                                )
                                                            }
                                                            disabled={isImageLoading(
                                                                'interior'
                                                            )}
                                                        />
                                                    </label>
                                                    <button
                                                        type="button"
                                                        className={
                                                            styles.imageButtonSecondary
                                                        }
                                                        onClick={() =>
                                                            handleImageDelete(
                                                                'interior'
                                                            )
                                                        }
                                                        disabled={isImageLoading(
                                                            'interior'
                                                        )}
                                                    >
                                                        Borrar todas
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Comidas */}
                                            <div className={styles.imageGroup}>
                                                <p
                                                    className={
                                                        styles.imageTitle
                                                    }
                                                >
                                                    Comidas
                                                </p>
                                                {imagenesComidaUrls &&
                                                    imagenesComidaUrls.length >
                                                    0 ? (
                                                    <div
                                                        className={
                                                            styles.imageMultiPreview
                                                        }
                                                    >
                                                        {imagenesComidaUrls.map(
                                                            (url, idx) => (
                                                                <img
                                                                    key={
                                                                        url +
                                                                        idx
                                                                    }
                                                                    src={url}
                                                                    alt={`Comida ${idx +
                                                                        1}`}
                                                                    className={
                                                                        styles.imagePreviewSmall
                                                                    }
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p
                                                        className={
                                                            styles.imageEmpty
                                                        }
                                                    >
                                                        Sin imágenes
                                                    </p>
                                                )}
                                                <div
                                                    className={
                                                        styles.imageActions
                                                    }
                                                >
                                                    <label
                                                        className={
                                                            styles.imageButton
                                                        }
                                                    >
                                                        {isImageLoading(
                                                            'comidas'
                                                        )
                                                            ? 'Subiendo...'
                                                            : 'Reemplazar'}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            className={
                                                                styles.imageFileInput
                                                            }
                                                            onChange={e =>
                                                                handleImageUpload(
                                                                    'comidas',
                                                                    e.target
                                                                        .files
                                                                )
                                                            }
                                                            disabled={isImageLoading(
                                                                'comidas'
                                                            )}
                                                        />
                                                    </label>
                                                    <button
                                                        type="button"
                                                        className={
                                                            styles.imageButtonSecondary
                                                        }
                                                        onClick={() =>
                                                            handleImageDelete(
                                                                'comidas'
                                                            )
                                                        }
                                                        disabled={isImageLoading(
                                                            'comidas'
                                                        )}
                                                    >
                                                        Borrar todas
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Menú */}
                                            <div className={styles.imageGroup}>
                                                <p
                                                    className={
                                                        styles.imageTitle
                                                    }
                                                >
                                                    Imagen de menú
                                                </p>
                                                {imagenMenuUrl ? (
                                                    <img
                                                        src={imagenMenuUrl}
                                                        alt="Imagen de menú"
                                                        className={
                                                            styles.imagePreview
                                                        }
                                                    />
                                                ) : (
                                                    <p
                                                        className={
                                                            styles.imageEmpty
                                                        }
                                                    >
                                                        Sin imagen de menú
                                                    </p>
                                                )}
                                                <div
                                                    className={
                                                        styles.imageActions
                                                    }
                                                >
                                                    <label
                                                        className={
                                                            styles.imageButton
                                                        }
                                                    >
                                                        {isImageLoading(
                                                            'menu'
                                                        )
                                                            ? 'Subiendo...'
                                                            : 'Cambiar'}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className={
                                                                styles.imageFileInput
                                                            }
                                                            onChange={e =>
                                                                handleImageUpload(
                                                                    'menu',
                                                                    e.target
                                                                        .files
                                                                )
                                                            }
                                                            disabled={isImageLoading(
                                                                'menu'
                                                            )}
                                                        />
                                                    </label>
                                                    <button
                                                        type="button"
                                                        className={
                                                            styles.imageButtonSecondary
                                                        }
                                                        onClick={() =>
                                                            handleImageDelete(
                                                                'menu'
                                                            )
                                                        }
                                                        disabled={isImageLoading(
                                                            'menu'
                                                        )}
                                                    >
                                                        Borrar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </section>
                    </div>

                    {/* Panel derecho: reseñas */}
                    <aside className={styles.rightPanel}>
                        <header className={styles.reviewsHeader}>
                            <h2>Reseñas</h2>
                            <span className={styles.reviewsCount}>
                                {totalReviews}
                            </span>
                        </header>

                                                <div className={styles.reviewsList}>
                            {totalReviews === 0 ? (
                                <p className={styles.reviewsPlaceholder}>
                                    Aquí se mostrarán las reseñas del
                                    restaurante.
                                </p>
                            ) : (
                                <ul className={styles.reviewsItems}>
                                    {displayedReviews.map(review => {
                                        const rating = getReviewRating(review)
                                        const text = getReviewText(review)
                                        const date = getReviewDate(review)
                                        const image = getReviewImage(review)

                                        return (
                                            <li
                                                key={review.id}
                                                className={styles.reviewItem}
                                            >
                                                <div
                                                    className={
                                                        styles.reviewHeader
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.reviewHeaderMain
                                                        }
                                                    >
                                                        <span
                                                            className={
                                                                styles.reviewAuthor
                                                            }
                                                        >
                                                            {review.autor}
                                                        </span>
                                                        {date && (
                                                            <span
                                                                className={
                                                                    styles.reviewDate
                                                                }
                                                            >
                                                                {new Date(
                                                                    date
                                                                ).toLocaleDateString(
                                                                    'es-AR'
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div
                                                        className={
                                                            styles.reviewRatingWrapper
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.reviewStars
                                                            }
                                                        >
                                                            {Array.from({
                                                                length: 5,
                                                            }).map((_, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className={
                                                                        idx <
                                                                        rating
                                                                            ? styles.starFilled
                                                                            : styles.starEmpty
                                                                    }
                                                                >
                                                                    ★
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <span
                                                            className={
                                                                styles.reviewRatingValue
                                                            }
                                                        >
                                                            {rating}
                                                        </span>
                                                    </div>
                                                </div>

                                                {image && (
                                                    <div
                                                        className={
                                                            styles.reviewImageWrapper
                                                        }
                                                    >
                                                        <img
                                                            src={image}
                                                            alt={`Foto de reseña de ${review.autor}`}
                                                            className={
                                                                styles.reviewImage
                                                            }
                                                        />
                                                    </div>
                                                )}

                                                {text && (
                                                    <p
                                                        className={
                                                            styles.reviewText
                                                        }
                                                    >
                                                        {text}
                                                    </p>
                                                )}
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </div>


                    </aside>
                </section>
            </div>
        </main>
    )
}

