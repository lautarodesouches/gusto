import { useState, useEffect } from 'react'
import { Restaurant, RegisterItem, Review } from '@/types'
import { getRestaurantData, updateRestaurant, updateRestaurantImage } from '@/app/actions/restaurant'
import type { ScheduleState } from '@/components/CreateRestaurant/TimeTable'
import { ImageType, SaveState, ImageSaveState } from './DataView'

export function useRestaurantDashboard(restaurant: Restaurant) {
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

            type RawScheduleItem = {
                dia?: string
                cerrado?: boolean
                desde?: string
                hasta?: string
            }

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

            for (const item of parsed as RawScheduleItem[]) {
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

    // Cargar catálogo de gustos y restricciones
    useEffect(() => {
        const loadData = async () => {
            const res = await getRestaurantData()
            if (res.success && res.data) {
                if (res.data.gustos) setGustos(res.data.gustos)
                if (res.data.restricciones) setRestricciones(res.data.restricciones)
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
    // Guardar cambios básicos
    // --------------------
    const handleSaveBasics = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaveState({ loading: true, error: '', success: '' })

        if (!direccion.trim()) {
            setSaveState({
                loading: false,
                error: 'La dirección es obligatoria',
                success: '',
            })
            return
        }

        type UpdateRestaurantPayload = {
            direccion: string
            lat: number
            lng: number
            webUrl?: string | null
            horariosJson?: string
            gustosQueSirveIds?: string[]
            restriccionesQueRespetaIds?: string[]
        }

        const payload: UpdateRestaurantPayload = {
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

        const res = await updateRestaurant(restaurant.id, payload)

        if (!res.success) {
            setSaveState({
                loading: false,
                error: res.error || 'Error al guardar cambios',
                success: '',
            })
            return
        }

        setSaveState({
            loading: false,
            error: '',
            success: 'Cambios guardados correctamente',
        })
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

        const formData = new FormData()

        if (tipo === 'destacada' || tipo === 'logo' || tipo === 'menu') {
            formData.append('archivo', files[0])
        } else {
            Array.from(files).forEach(file => {
                formData.append('archivos', file)
            })
        }

        const res = await updateRestaurantImage(restaurant.id, tipo, formData)

        if (!res.success) {
            setImageState({
                loadingType: null,
                error: res.error || 'Error al actualizar imagen',
                success: '',
            })
            return
        }

        const data = res.data

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
    }

    const handleImageDelete = async (tipo: ImageType) => {
        setImageState({
            loadingType: tipo,
            error: '',
            success: '',
        })

        const formData = new FormData()
        formData.append('soloBorrar', 'true')

        const res = await updateRestaurantImage(restaurant.id, tipo, formData)

        if (!res.success) {
            setImageState({
                loadingType: null,
                error: res.error || 'Error al borrar imagen',
                success: '',
            })
            return
        }

        const data = res.data

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
    }

    const isImageLoading = (tipo: ImageType) =>
        imageState.loadingType === tipo

    return {
        direccion,
        setDireccion,
        webUrl,
        setWebUrl,
        lat,
        lng,
        schedule,
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
    }
}
