'use client'
import { useState, useEffect, useCallback } from 'react'
import styles from './page.module.css'
import { AuthInput } from '@/components'
import {
    RestaurantSelect,
    RestaurantTimeTable,
    RestaurantImageUpload,
    RestaurantMap,
    LoadingOverlay,
    SuccessModal,
    ErrorAlert,
} from '@/components/CreateRestaurant'
import Link from 'next/link'
import { ROUTES } from '@/routes'
import { useRouter } from 'next/navigation'

type ScheduleState = {
    [key: string]: {
        from: string
        to: string
        locked: boolean
    }
}

type FormData = {
    nombre: string
    direccion: string
    lat?: number
    lng?: number
    website: string
    restrictions: string[]
    tastes: string[]
}

type RegisterItem = {
    id: string | number
    nombre: string
}

export default function RestaurantRegister() {
    const router = useRouter()
    const [formData, setFormData] = useState<FormData>({
        nombre: '',
        direccion: '',
        website: '',
        restrictions: [],
        tastes: [],
    })
    const [schedule, setSchedule] = useState<ScheduleState>({})
    const [gustos, setGustos] = useState<RegisterItem[]>([])
    const [restricciones, setRestricciones] = useState<RegisterItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string>('')
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})
    const [showSuccess, setShowSuccess] = useState(false)
    
    // Archivos
    const [imagenDestacada, setImagenDestacada] = useState<File[]>([])
    const [imagenesInterior, setImagenesInterior] = useState<File[]>([])
    const [imagenesComidas, setImagenesComidas] = useState<File[]>([])
    const [imagenMenu, setImagenMenu] = useState<File[]>([])
    const [logo, setLogo] = useState<File[]>([])

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch('/api/restaurante/datos')
                
                if (!response.ok) {
                    return
                }
                
                const data = await response.json()
                
                if (data.gustos && Array.isArray(data.gustos)) {
                    setGustos(data.gustos)
                }
                
                if (data.restricciones && Array.isArray(data.restricciones)) {
                    setRestricciones(data.restricciones)
                }
            } catch {
                // Error silencioso
            }
        }
        
        loadData()
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string[]) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleLocationSelect = useCallback((lat: number, lng: number, address: string) => {
        const latNum = Number(lat)
        const lngNum = Number(lng)
        
        if (isNaN(latNum) || isNaN(lngNum)) {
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
        
        setFormData(prev => ({
            ...prev,
            lat: latRounded,
            lng: lngRounded,
            direccion: address || prev.direccion,
        }))
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        setValidationErrors({})

        try {
            if (!formData.nombre.trim()) {
                setError('El nombre del restaurante es requerido')
                setIsLoading(false)
                return
            }

            if (!formData.direccion.trim()) {
                setError('La dirección es requerida')
                setIsLoading(false)
                return
            }

            const formDataToSend = new FormData()
            
            formDataToSend.append('nombre', formData.nombre.trim())
            formDataToSend.append('direccion', formData.direccion.trim())
            
            if (formData.website && formData.website.trim()) {
                formDataToSend.append('WebsiteUrl', formData.website.trim())
            }
            
            if (formData.lat !== undefined && formData.lat !== null) {
                const latNum = Number(formData.lat)
                
                if (!isNaN(latNum) && latNum >= -90 && latNum <= 90) {
                    let latFormatted = latNum.toFixed(7)
                    latFormatted = latFormatted.replace(',', '.')
                    formDataToSend.append('lat', latFormatted)
                }
            }
            
            if (formData.lng !== undefined && formData.lng !== null) {
                const lngNum = Number(formData.lng)
                
                if (!isNaN(lngNum) && lngNum >= -180 && lngNum <= 180) {
                    let lngFormatted = lngNum.toFixed(7)
                    lngFormatted = lngFormatted.replace(',', '.')
                    formDataToSend.append('lng', lngFormatted)
                }
            }

            const horariosArray = Object.entries(schedule).map(([key, value]) => {
                const dayMap: Record<string, string> = {
                    lunes: 'Lunes',
                    martes: 'Martes',
                    miercoles: 'Miércoles',
                    jueves: 'Jueves',
                    viernes: 'Viernes',
                    sabado: 'Sábado',
                    domingo: 'Domingo',
                }
                
                return {
                    dia: dayMap[key] || key,
                    cerrado: value.locked,
                    ...(value.locked ? {} : { desde: value.from, hasta: value.to }),
                }
            })
            
            const horariosJson = JSON.stringify(horariosArray)
            formDataToSend.append('horarios', horariosJson)

            const gustosIds = formData.tastes
                .map(nombre => {
                    const gusto = gustos.find(g => 
                        g.nombre.toLowerCase() === nombre.toLowerCase()
                    )
                    return gusto?.id
                })
                .filter((id): id is string | number => id !== undefined)
            
            gustosIds.forEach(id => {
                formDataToSend.append('gustosQueSirveIds', id.toString())
            })

            const restriccionesIds = formData.restrictions
                .map(nombre => {
                    const restriccion = restricciones.find(r => 
                        r.nombre.toLowerCase() === nombre.toLowerCase()
                    )
                    return restriccion?.id
                })
                .filter((id): id is string | number => id !== undefined)
            
            restriccionesIds.forEach(id => {
                formDataToSend.append('restriccionesQueRespetaIds', id.toString())
            })

            if (imagenDestacada.length > 0) {
                formDataToSend.append('imagenDestacada', imagenDestacada[0])
            }
            
            imagenesInterior.forEach(file => {
                formDataToSend.append('imagenesInterior', file)
            })
            
            imagenesComidas.forEach(file => {
                formDataToSend.append('imagenesComidas', file)
            })
            
            if (imagenMenu.length > 0) {
                formDataToSend.append('imagenMenu', imagenMenu[0])
            }
            
            if (logo.length > 0) {
                formDataToSend.append('logo', logo[0])
            }

            const response = await fetch('/api/restaurante/agregar', {
                method: 'POST',
                body: formDataToSend,
            })

            if (!response.ok) {
                let errorMessage = ''
                let errors: Record<string, string[]> = {}
                
                try {
                    const errorData = await response.json()
                    
                    // Si hay errores de validación estructurados, guardarlos
                    if (errorData.errors && typeof errorData.errors === 'object') {
                        errors = errorData.errors as Record<string, string[]>
                        // Si hay errores de validación, no mostrar mensaje general
                        errorMessage = ''
                    } else {
                        // Solo mostrar mensaje si no hay errores de validación
                        errorMessage = errorData.error || errorData.message || `Error ${response.status}: ${response.statusText}`
                    }
                } catch {
                    // Si no se puede parsear JSON, intentar leer como texto
                    const errorText = await response.text().catch(() => '')
                    if (errorText) {
                        errorMessage = errorText
                    } else {
                        errorMessage = `Error ${response.status}: ${response.statusText}`
                    }
                }
                
                setError(errorMessage)
                setValidationErrors(errors)
                setIsLoading(false)
                return
            }

            setIsLoading(false)
            setShowSuccess(true)
        } catch (err) {
            const errorMessage = err instanceof Error 
                ? err.message 
                : 'Error inesperado. Por favor intenta de nuevo.'
            setError(errorMessage)
            setIsLoading(false)
        }
    }

    const handleSuccessClose = () => {
        setShowSuccess(false)
        router.push(ROUTES.HOME)
    }

    const restrictionsOptions = restricciones.map(r => r.nombre)
    const tastesOptions = gustos.map(g => g.nombre)

    return (
        <div className={styles.page}>
            <header className={styles.page__header}>
                <div className={styles.page__brand}>
                    <Link href={ROUTES.HOME}>
                        <span className={styles.page__logo}>GUSTO!</span>
                    </Link>
                    <span className={styles.page__title}>Restaurante</span>
                </div>
            </header>

            <form className={styles.page__form} onSubmit={handleSubmit}>
                <div className={styles.page__left}>
                    {/* Sobre el Restaurante */}
                    <section className={styles.section}>
                        <h2 className={styles.section__title}>
                            Sobre el <span>Restaurante</span>
                        </h2>
                        <div className={styles.section__content}>
                            <AuthInput
                                name="nombre"
                                type="text"
                                placeholder="Nombre del restaurante"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                required
                            />
                            <AuthInput
                                name="website"
                                type="url"
                                placeholder="Sitio web"
                                value={formData.website}
                                onChange={handleInputChange}
                            />
                            <RestaurantSelect
                                name="restrictions"
                                placeholder="Restricciones que Respeta"
                                options={restrictionsOptions}
                                value={formData.restrictions}
                                onChange={handleSelectChange}
                                multiple
                            />
                            <RestaurantSelect
                                name="tastes"
                                placeholder="Gustos que ofrece"
                                options={tastesOptions}
                                value={formData.tastes}
                                onChange={handleSelectChange}
                                multiple
                            />
                        </div>
                    </section>

                    {/* Horarios */}
                    <section className={styles.section}>
                        <h2 className={styles.section__title}>
                            Horarios de{' '}
                            <span className={styles['section__title--green']}>
                                Apertura
                            </span>{' '}
                            y <span>Cierre</span>
                        </h2>
                        <div className={styles.section__content}>
                            <RestaurantTimeTable onScheduleChange={setSchedule} />
                        </div>
                    </section>
                </div>

                <div className={styles.page__right}>
                    {/* Registro de Dirección */}
                    <section className={styles.section}>
                        <h2 className={styles.section__title}>
                            Registro de <span>Direccion</span>
                        </h2>
                        <div className={styles.section__content}>
                            <RestaurantMap
                                address={formData.direccion}
                                onLocationSelect={handleLocationSelect}
                            />
                        </div>
                    </section>

                    {/* Imágenes */}
                    <section className={styles.section}>
                        <div className={styles.images}>
                            <div className={styles.images__row}>
                                <RestaurantImageUpload
                                    label="Imagen"
                                    sublabel="Destacada"
                                    maxImages={1}
                                    onFilesChange={setImagenDestacada}
                                />
                                <RestaurantImageUpload
                                    label="Imagenes"
                                    sublabel="del Interior"
                                    multiple
                                    maxImages={3}
                                    onFilesChange={setImagenesInterior}
                                />
                            </div>
                            <div className={styles.images__row}>
                                <RestaurantImageUpload
                                    label="Imagenes"
                                    sublabel="de Comidas"
                                    multiple
                                    maxImages={3}
                                    onFilesChange={setImagenesComidas}
                                />
                                <RestaurantImageUpload
                                    label="Imagen"
                                    sublabel="de Menu"
                                    maxImages={1}
                                    onFilesChange={setImagenMenu}
                                />
                            </div>
                            <div className={styles.images__single}>
                                <RestaurantImageUpload
                                    label="Logo"
                                    maxImages={1}
                                    onFilesChange={setLogo}
                                />
                            </div>
                        </div>
                    </section>
                </div>
                
                {(error || Object.keys(validationErrors).length > 0) && (
                    <>
                        <ErrorAlert 
                            message={error} 
                            errors={Object.keys(validationErrors).length > 0 ? validationErrors : undefined}
                            onClose={() => {
                                setError('')
                                setValidationErrors({})
                            }} 
                        />
                        {/* Overlay para oscurecer el fondo */}
                        <div 
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.5)',
                                zIndex: 9999,
                                pointerEvents: 'none',
                            }}
                            onClick={() => {
                                setError('')
                                setValidationErrors({})
                            }}
                        />
                    </>
                )}
                
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <button 
                        type="submit" 
                        className={styles.page__button}
                        disabled={isLoading}
                    >
                        Enviar Solicitud
                    </button>
                </div>
            </form>

            {isLoading && <LoadingOverlay />}
            
            {showSuccess && (
                <SuccessModal onClose={handleSuccessClose} />
            )}
        </div>
    )
}
