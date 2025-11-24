'use client'
import Image from 'next/image'
import styles from './page.module.css'
import { Restaurant, Review } from '@/types'
import ReviewModal from '@/components/Review/Form/ReviewModal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faBookmark,
    faImage,
    faGlobe,
    faBuilding,
    faPen,
    faPhone,
    faEnvelope,
    faTimes,
    faChevronLeft,
    faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { faBookmark as faBookmarkEmpty } from '@fortawesome/free-regular-svg-icons'
import Link from 'next/link'
import { formatPhoneAR } from '@/utils'
import RatingDistribution from '../Rating'
import ReviewList from '../Reviews'
import RestaurantMap from '../Map'
import { MapProvider } from '@/components/Map/MapProvider'
import { useEffect, useState, useRef } from 'react'
import { getRecomendacion } from '@/app/restaurante/actions'

interface Props {
    restaurant: Restaurant
    reviews: Review[]
    isFavourite: boolean
    onFavourite: () => void
}

export default function RestaurantView({
    restaurant,
    reviews,
    isFavourite,
    onFavourite,
}: Props) {
    const [activeSection, setActiveSection] = useState<string>('descripcion')
    const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({})
    const [explicacion, setExplicacion] = useState<string | null>(null)
    const [loadingExplicacion, setLoadingExplicacion] = useState<boolean>(false)
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
    const [showMenuModal, setShowMenuModal] = useState(false)
    const [showReviewModal, setShowReviewModal] = useState(false)
    
    // Combinar todas las imágenes en un solo array para el lightbox (sin incluir el menú OCR)
    const allImages = [
        ...(restaurant.imagenesInterior || []).map((url, idx) => ({ url, type: 'interior', index: idx })),
        ...(restaurant.imagenesComida || []).map((url, idx) => ({ url, type: 'comida', index: idx })),
    ].filter(img => img.url)
    
    const currentImage = selectedImageIndex !== null ? allImages[selectedImageIndex] : null
    
    const handleNextImage = () => {
        if (selectedImageIndex !== null && selectedImageIndex < allImages.length - 1) {
            setSelectedImageIndex(selectedImageIndex + 1)
        }
    }
    
    const handlePrevImage = () => {
        if (selectedImageIndex !== null && selectedImageIndex > 0) {
            setSelectedImageIndex(selectedImageIndex - 1)
        }
    }
    
    // Helper para validar URLs y evitar URLs problemáticas de Google Places API
    const getSafeImageUrl = (url: string | null | undefined, fallback: string): string => {
        if (!url) return fallback
        // Si la URL es de Google Places API (que está dando 404), usar fallback directamente
        if (url.includes('places.googleapis.com')) return fallback
        return url
    }

    useEffect(() => {
        const loadRecomendacion = async () => {
            if (!restaurant.id) return
            
            setLoadingExplicacion(true)
            try {
                const result = await getRecomendacion(restaurant.id)
                if (result.success && result.data) {
                    setExplicacion(result.data.explicacion)
                }
            } catch (error) {
                console.error('Error loading recomendacion:', error)
            } finally {
                setLoadingExplicacion(false)
            }
        }
        
        loadRecomendacion()
    }, [restaurant.id])

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0,
        }

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id || 'descripcion'
                    setActiveSection(id)
                }
            })
        }

        const observer = new IntersectionObserver(
            observerCallback,
            observerOptions
        )

        // Observar todas las secciones (solo horarios si es de la app)
        const sections = restaurant.esDeLaApp 
            ? ['descripcion', 'horarios', 'ubicacion', 'opiniones']
            : ['descripcion', 'ubicacion', 'opiniones']
        sections.forEach(sectionId => {
            const element = document.getElementById(sectionId)
            if (element) {
                sectionsRef.current[sectionId] = element
                observer.observe(element)
            }
        })

        return () => {
            Object.values(sectionsRef.current).forEach(element => {
                if (element) {
                    observer.unobserve(element)
                }
            })
        }
    }, [])

    // Parsear horarios si el restaurante es de la app
    const parseHorarios = (): Array<{ day: string; hours: string; cerrado: boolean }> => {
        if (!restaurant.esDeLaApp || !restaurant.horariosJson) {
            return []
        }
        
        try {
            const horarios = JSON.parse(restaurant.horariosJson)
            if (!Array.isArray(horarios)) return []
            
            // Orden de días de la semana
            const ordenDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
            
            return horarios
                .sort((a, b) => {
                    const indexA = ordenDias.indexOf(a.dia as string)
                    const indexB = ordenDias.indexOf(b.dia as string)
                    return indexA - indexB
                })
                .map((horario: Record<string, unknown>) => ({
                    day: (horario.dia || '') as string,
                    hours: (horario.cerrado as boolean)
                        ? 'Cerrado' 
                        : (horario.desde && horario.hasta)
                            ? `De ${horario.desde} a ${horario.hasta}`
                            : 'Horario no disponible',
                    cerrado: (horario.cerrado || false) as boolean
                }))
        } catch (error) {
            console.error('Error parseando horarios:', error)
            return []
        }
    }
    
    const horarios = parseHorarios()
    
    // Función para calcular el estado actual (abierto/cerrado) y hora de cierre
    const getEstadoActual = (): { abierto: boolean; mensaje: string; color: string } => {
        if (!restaurant.esDeLaApp || horarios.length === 0) {
            return { abierto: false, mensaje: 'Horario no disponible', color: '#888' }
        }
        
        const ahora = new Date()
        const diaActual = ahora.getDay() // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
        const horaActual = ahora.getHours()
        const minutoActual = ahora.getMinutes()
        const horaActualTotal = horaActual * 60 + minutoActual // Convertir a minutos desde medianoche
        
        // Mapear día de JS (0-6) a días de la semana en español
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
        const diaActualNombre = diasSemana[diaActual]
        
        // Buscar el horario del día actual
        const horarioHoy = horarios.find(h => h.day === diaActualNombre)
        
        if (!horarioHoy) {
            return { abierto: false, mensaje: 'Horario no disponible', color: '#888' }
        }
        
        if (horarioHoy.cerrado) {
            return { abierto: false, mensaje: 'Cerrado hoy', color: '#ff6b6b' }
        }
        
        // Parsear las horas de apertura y cierre (formato: "De 12:00 a 22:00")
        const match = horarioHoy.hours.match(/De (\d{1,2}):(\d{2}) a (\d{1,2}):(\d{2})/)
        if (!match) {
            return { abierto: true, mensaje: 'Abierto', color: '#4ade80' }
        }
        
        const horaApertura = parseInt(match[1], 10)
        const minutoApertura = parseInt(match[2], 10)
        const horaCierre = parseInt(match[3], 10)
        const minutoCierre = parseInt(match[4], 10)
        
        const horaAperturaTotal = horaApertura * 60 + minutoApertura
        const horaCierreTotal = horaCierre * 60 + minutoCierre
        
        // Verificar si está dentro del horario de apertura
        if (horaActualTotal >= horaAperturaTotal && horaActualTotal < horaCierreTotal) {
            return { 
                abierto: true, 
                mensaje: `Abierto hasta las ${match[3]}:${match[4]}`, 
                color: '#4ade80' 
            }
        } else if (horaActualTotal < horaAperturaTotal) {
            // Aún no ha abierto
            return { 
                abierto: false, 
                mensaje: `Abre a las ${match[1]}:${match[2]}`, 
                color: '#fbbf24' 
            }
        } else {
            // Ya cerró
            return { abierto: false, mensaje: 'Cerrado', color: '#ff6b6b' }
        }
    }
    
    const estadoActual = getEstadoActual()

    // Obtener el rating, usando valoracion como fallback si rating es null/undefined
    const rating = restaurant.rating ?? restaurant.valoracion ?? 0

    const stars = []

    for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
            stars.push(
                <Image
                    src="/images/all/star.svg"
                    alt=""
                    width={30}
                    height={30}
                    className={styles.top__star}
                    key={i}
                />
            )
        } else if (rating >= i - 0.5) {
            stars.push(
                <Image
                    src="/images/all/star-half.svg"
                    alt=""
                    width={30}
                    height={30}
                    className={styles.top__star}
                    key={i}
                />
            )
        } else {
            stars.push(
                <Image
                    src="/images/all/star-empty.svg"
                    alt=""
                    width={30}
                    height={30}
                    className={styles.top__star}
                    key={i}
                />
            )
        }
    }

    // Calcular conteos de imágenes
    const interiorCount = restaurant.imagenesInterior?.length || 0
    const comidaCount = restaurant.imagenesComida?.length || 0
    const menuCount = restaurant.menu ? 
        restaurant.menu.categorias.reduce((acc, cat) => acc + cat.items.length, 0) : 0
    
    // Para restaurantes de la app, mostrar imágenes organizadas
    // Para restaurantes de Google Places, mantener la estructura anterior
    // Calcular índices para el lightbox
    const _getImageIndex = (type: string, index: number) => {
        if (type === 'interior') return index
        if (type === 'comida') return interiorCount + index
        return interiorCount + comidaCount
    }
    
    const sideItems = restaurant.esDeLaApp ? [
        { title: 'Interior', count: interiorCount, images: restaurant.imagenesInterior || [], type: 'interior' },
        { title: 'Comida', count: comidaCount, images: restaurant.imagenesComida || [], type: 'comida' },
        ...(restaurant.menu ? [{ title: 'Menú', count: menuCount, type: 'menu' }] : []),
    ].filter(item => item.count > 0 || item.title === 'Menú') : [
        { title: 'Interior', count: 8, type: 'interior' },
        { title: 'Comida', count: 12, type: 'comida' },
        { title: 'Menú', count: 15, type: 'menu' },
    ]

    return (
        <main className={styles.main}>
            <section className={styles.top}>
                <header className={styles.top__header}>
                    <div className={styles.top__thumnailcontainer}>
                        <Image
                            src={getSafeImageUrl(
                                restaurant.esDeLaApp 
                                    ? (restaurant.logoUrl || restaurant.imagenUrl)
                                    : restaurant.imagenUrl,
                                `/images/restaurant/logo.png`
                            )}
                            alt="Icono del restaurante"
                            width={200}
                            height={200}
                            className={styles.top__thumnail}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = '/images/restaurant/logo.png'
                            }}
                        />
                    </div>
                    <div className={styles.top__info}>
                        <h2 className={styles.top__title}>
                            {restaurant.nombre}
                        </h2>
                        <div className={styles.top__rating}>
                            <span className={styles.top__number}>
                                {rating > 0 ? rating.toFixed(1) : 'N/A'}
                            </span>
                            <div className={styles.top__stars}>{stars}</div>
                        </div>
                    </div>
                    <div className={styles.top__aside}>
                        <button
                            className={styles.top__button}
                            onClick={onFavourite}
                        >
                            <FontAwesomeIcon
                                className={styles.top__icon}
                                icon={
                                    isFavourite ? faBookmark : faBookmarkEmpty
                                }
                            />
                            {isFavourite ? 'Eliminar de guardados' : 'Guardar'}
                        </button>
                    </div>
                </header>
                <div className={styles.gallery}>
                    {/* Imagen principal */}
                    <div 
                        className={styles.gallery__main}
                        onClick={() => {
                            if (restaurant.esDeLaApp && allImages.length > 0) {
                                setSelectedImageIndex(0)
                            }
                        }}
                        style={restaurant.esDeLaApp && allImages.length > 0 ? { cursor: 'pointer' } : {}}
                    >
                        <Image
                            src={getSafeImageUrl(
                                restaurant.imagenUrl || restaurant.imagenDestacada,
                                `/images/restaurant/main.png`
                            )}
                            className={styles.gallery__mainimage}
                            alt="Imagen destacada del restaurante"
                            width={800}
                            height={600}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = '/images/restaurant/main.png'
                            }}
                        />
                        <div className={styles.gallery__badge}>
                            <FontAwesomeIcon
                                icon={faImage}
                                className={styles.gallery__badgeicon}
                            />
                            <span>
                                {restaurant.esDeLaApp 
                                    ? allImages.length
                                    : 25
                                }
                            </span>
                        </div>
                    </div>

                    {/* Fila de 3 imágenes debajo */}
                    <div className={styles['gallery__side']}>
                        {/* Primera imagen de interior */}
                        {restaurant.imagenesInterior && restaurant.imagenesInterior.length > 0 && (
                            <div
                                className={`${styles['gallery__side-item']} ${styles['gallery__side-item--clickable']}`}
                                onClick={() => setSelectedImageIndex(0)}
                                style={{ cursor: 'pointer' }}
                            >
                                <Image
                                    className={styles['gallery__side-image']}
                                    src={getSafeImageUrl(restaurant.imagenesInterior[0], '/images/restaurant/interior.png')}
                                    alt="Interior"
                                    width={400}
                                    height={300}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.src = '/images/restaurant/interior.png'
                                    }}
                                />
                                <div className={styles['gallery__side-info']}>
                                    <span className={styles['gallery__side-title']}>Interior</span>
                                </div>
                            </div>
                        )}
                        
                        {/* Primera imagen de comida */}
                        {restaurant.imagenesComida && restaurant.imagenesComida.length > 0 && (
                            <div
                                className={`${styles['gallery__side-item']} ${styles['gallery__side-item--clickable']}`}
                                onClick={() => {
                                    const comidaIndex = interiorCount
                                    if (comidaIndex < allImages.length) {
                                        setSelectedImageIndex(comidaIndex)
                                    }
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                <Image
                                    className={styles['gallery__side-image']}
                                    src={getSafeImageUrl(restaurant.imagenesComida[0], '/images/restaurant/comida.png')}
                                    alt="Comida"
                                    width={400}
                                    height={300}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.src = '/images/restaurant/comida.png'
                                    }}
                                />
                                <div className={styles['gallery__side-info']}>
                                    <span className={styles['gallery__side-title']}>Comida</span>
                                </div>
                            </div>
                        )}
                        
                        {/* Menú */}
                        {restaurant.menu && (
                            <div
                                className={`${styles['gallery__side-item']} ${styles['gallery__side-item--clickable']}`}
                                onClick={() => setShowMenuModal(true)}
                                style={{ cursor: 'pointer' }}
                            >
                                <Image
                                    className={styles['gallery__side-image']}
                                    src="/images/restaurant/menu.png"
                                    alt="Menú"
                                    width={400}
                                    height={300}
                                />
                                <div className={styles['gallery__side-info']}>
                                    <span className={styles['gallery__side-title']}>Menú</span>
                                </div>
                            </div>
                        )}
                        
                        {/* Fallback si no hay imágenes */}
                        {(!restaurant.imagenesInterior || restaurant.imagenesInterior.length === 0) && 
                         (!restaurant.imagenesComida || restaurant.imagenesComida.length === 0) && 
                         !restaurant.menu && (
                            <>
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className={styles['gallery__side-item']}
                                    >
                                        <Image
                                            className={styles['gallery__side-image']}
                                            src={`/images/restaurant/${i === 1 ? 'interior' : i === 2 ? 'comida' : 'menu'}.png`}
                                            alt={`Imagen ${i}`}
                                            width={400}
                                            height={300}
                                        />
                                        <div className={styles['gallery__side-info']}>
                                            <span className={styles['gallery__side-title']}>
                                                {i === 1 ? 'Interior' : i === 2 ? 'Comida' : 'Menú'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </section>
            {currentImage && (
                <div className={styles.gallery__lightbox} onClick={() => setSelectedImageIndex(null)}>
                    <div className={styles.gallery__lightboxContent} onClick={(e) => e.stopPropagation()}>
                        <button
                            className={styles.gallery__lightboxClose}
                            onClick={() => setSelectedImageIndex(null)}
                            aria-label="Cerrar"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                        {selectedImageIndex !== null && selectedImageIndex > 0 && (
                            <button
                                className={styles.gallery__lightboxNav} 
                                style={{ left: '20px' }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handlePrevImage()
                                }}
                                aria-label="Imagen anterior"
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                        )}
                        {selectedImageIndex !== null && selectedImageIndex < allImages.length - 1 && (
                            <button
                                className={styles.gallery__lightboxNav}
                                style={{ right: '20px' }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleNextImage()
                                }}
                                aria-label="Imagen siguiente"
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        )}
                        <div className={styles.gallery__lightboxImageContainer}>
                            <Image
                                src={getSafeImageUrl(currentImage.url, '/images/all/poster.jpg')}
                                alt={`${currentImage.type} ${currentImage.index + 1}`}
                                width={1200}
                                height={800}
                                className={styles.gallery__lightboxImage}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = '/images/all/poster.jpg'
                                }}
                            />
                        </div>
                        <div className={styles.gallery__lightboxInfo}>
                            <span className={styles.gallery__lightboxCounter}>
                                {selectedImageIndex !== null ? selectedImageIndex + 1 : 0} / {allImages.length}
                            </span>
                            <span className={styles.gallery__lightboxType}>
                                {currentImage.type === 'interior' ? 'Interior' : currentImage.type === 'comida' ? 'Comida' : 'Menú'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
            {showMenuModal && restaurant.menu && (
                <div className={styles.gallery__lightbox} onClick={() => setShowMenuModal(false)}>
                    <div className={styles.gallery__menuModal} onClick={(e) => e.stopPropagation()}>
                        <button
                            className={styles.gallery__lightboxClose}
                            onClick={() => setShowMenuModal(false)}
                            aria-label="Cerrar"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                        <div className={styles.gallery__menuModalContent}>
                            <div className={styles.gallery__menuModalHeader}>
                                <h3 className={styles.gallery__menuModalTitle}>Menú</h3>
                                {restaurant.menu.nombreMenu && (
                                    <p className={styles.gallery__menuModalSubtitle}>{restaurant.menu.nombreMenu}</p>
                                )}
                            </div>
                            <div className={styles.gallery__menuModalBody}>
                                {restaurant.menu.categorias.map((categoria, idx) => (
                                    <div key={idx} className={styles.gallery__menuModalCategory}>
                                        <h4 className={styles.gallery__menuModalCategoryTitle}>{categoria.nombre}</h4>
                                        <div className={styles.gallery__menuModalItems}>
                                            {categoria.items.map((item, itemIdx) => (
                                                <div key={itemIdx} className={styles.gallery__menuModalItem}>
                                                    <div className={styles.gallery__menuModalItemTop}>
                                                        <h5 className={styles.gallery__menuModalItemNombre}>{item.nombre}</h5>
                                                        {item.precios && item.precios.length === 1 && (
                                                            <span className={styles.gallery__menuModalItemPrecio}>
                                                                {restaurant.menu?.moneda || 'ARS'} {item.precios[0].monto.toFixed(2)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.descripcion && (
                                                        <p className={styles.gallery__menuModalItemDescripcion}>{item.descripcion}</p>
                                                    )}
                                                    {item.precios && item.precios.length > 1 && (
                                                        <div className={styles.gallery__menuModalPrecios}>
                                                            {item.precios.map((precio, precioIdx) => (
                                                                <div key={precioIdx} className={styles.gallery__menuModalPrecioItem}>
                                                                    <span className={styles.gallery__menuModalPrecioTamaño}>{precio.tamaño}</span>
                                                                    <span className={styles.gallery__menuModalPrecioMonto}>
                                                                        {restaurant.menu?.moneda || 'ARS'} {precio.monto.toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <nav className={styles.navbar}>
                <ul className={styles.navbar__ul}>
                    <li
                        className={`${styles.navbar__li} ${
                            activeSection === 'descripcion'
                                ? styles.navbar__li_active
                                : ''
                        }`}
                    >
                        <Link
                            className={styles.navbar__link}
                            href={`#descripcion`}
                            onClick={e => {
                                e.preventDefault()
                                document
                                    .getElementById('descripcion')
                                    ?.scrollIntoView({ behavior: 'smooth' })
                            }}
                        >
                            Descripcion General
                        </Link>
                    </li>
                    {restaurant.esDeLaApp && (
                        <li
                            className={`${styles.navbar__li} ${
                                activeSection === 'horarios'
                                    ? styles.navbar__li_active
                                    : ''
                            }`}
                        >
                            <Link
                                className={styles.navbar__link}
                                href={`#horarios`}
                                onClick={e => {
                                    e.preventDefault()
                                    document
                                        .getElementById('horarios')
                                        ?.scrollIntoView({ behavior: 'smooth' })
                                }}
                            >
                                Horarios
                            </Link>
                        </li>
                    )}
                    <li
                        className={`${styles.navbar__li} ${
                            activeSection === 'ubicacion'
                                ? styles.navbar__li_active
                                : ''
                        }`}
                    >
                        <Link
                            className={styles.navbar__link}
                            href={`#ubicacion`}
                            onClick={e => {
                                e.preventDefault()
                                document
                                    .getElementById('ubicacion')
                                    ?.scrollIntoView({ behavior: 'smooth' })
                            }}
                        >
                            Ubicación
                        </Link>
                    </li>
                    <li
                        className={`${styles.navbar__li} ${
                            activeSection === 'opiniones'
                                ? styles.navbar__li_active
                                : ''
                        }`}
                    >
                        <Link
                            className={styles.navbar__link}
                            href={`#opiniones`}
                            onClick={e => {
                                e.preventDefault()
                                document
                                    .getElementById('opiniones')
                                    ?.scrollIntoView({ behavior: 'smooth' })
                            }}
                        >
                            Opiniones
                        </Link>
                    </li>
                </ul>
            </nav>
            <section className={styles.info} id="descripcion">
                <div className={styles.data}>
                    <h3 className={styles.data__title}>
                        Un vistazo al restuarante
                    </h3>
                    {restaurant.esDeLaApp && horarios.length > 0 && (
                        <p className={styles.data__open} style={{ color: estadoActual.color }}>
                            {estadoActual.mensaje}
                        </p>
                    )}
                    <ul className={styles.data__list}>
                        {restaurant.webUrl && (
                            <li className={styles.data__item}>
                                <FontAwesomeIcon
                                    className={styles.data__icon}
                                    icon={faGlobe}
                                />
                                <Link 
                                    className={styles.data__link} 
                                    href={restaurant.webUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Página web
                                </Link>
                            </li>
                        )}
                        <li className={styles.data__item}>
                            <FontAwesomeIcon
                                className={styles.data__icon}
                                icon={faPhone}
                            />
                            <Link
                                className={styles.data__link}
                                href={`tel:541112345678`}
                            >
                                {formatPhoneAR(`+541112345678`)}
                            </Link>
                        </li>
                        <li className={styles.data__item}>
                            <FontAwesomeIcon
                                className={styles.data__icon}
                                icon={faEnvelope}
                            />
                            <Link
                                className={styles.data__link}
                                href={`mailto:contacto@empresa.com`}
                            >
                                contacto@empresa.com
                            </Link>
                        </li>
                    </ul>
                    <h3 className={styles.data__subtitle}>Acerca de</h3>
                    {restaurant.categoria && (
                        <p className={styles.data__info}>
                            <strong>Categoría:</strong> {restaurant.categoria}
                        </p>
                    )}
                    {loadingExplicacion ? (
                        <p className={styles.data__info}>
                            Cargando recomendación...
                        </p>
                    ) : explicacion ? (
                        <p className={styles.data__info}>
                            {explicacion}
                        </p>
                    ) : (
                        <p className={styles.data__info}>
                            {restaurant.esDeLaApp 
                                ? 'Restaurante registrado en la aplicación. Disfruta de información detallada, menú y reseñas de la comunidad.'
                                : 'Restaurante de Google Places. Información actualizada desde Google Maps.'}
                        </p>
                    )}
                    
                </div>
                {restaurant.esDeLaApp && horarios.length > 0 && (
                    <div className={styles.hours}>
                        <div className={styles.hours__div} id="horarios">
                            <h4 className={styles.hours__subtile}>Horarios</h4>
                            <ul className={styles.hours__ul}>
                                {horarios.map(item => (
                                    <li
                                        key={item.day}
                                        className={styles.schedule__item}
                                    >
                                        <span className={styles.schedule__day}>
                                            {item.day}
                                        </span>
                                        <span className={styles.schedule__hours}>
                                            {item.hours}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </section>
            <section className={styles.location} id="ubicacion">
                <header className={styles.location__header}>
                    <div className={styles.location__div}>
                        <h3 className={styles.location__title}>Ubicación</h3>
                    </div>
                    <div className={styles.location__div}>
                        <FontAwesomeIcon
                            className={styles.location__icon}
                            icon={faBuilding}
                        />
                        <span className={styles.location__span}>Localidad</span>
                    </div>
                </header>
                <div className={styles.location__map}>
                    {(() => {
                        // Validar que las coordenadas estén en rangos válidos
                        // Latitud: -90 a 90, Longitud: -180 a 180
                        const isValidLat = restaurant.latitud != null && 
                                         !isNaN(restaurant.latitud) && 
                                         restaurant.latitud >= -90 && 
                                         restaurant.latitud <= 90
                        
                        const isValidLng = restaurant.longitud != null && 
                                           !isNaN(restaurant.longitud) && 
                                           restaurant.longitud >= -180 && 
                                           restaurant.longitud <= 180
                        
                        const hasValidCoordinates = isValidLat && isValidLng
                        
                        if (hasValidCoordinates) {
                            return (
                                <MapProvider>
                                    <RestaurantMap
                                        lat={restaurant.latitud}
                                        lng={restaurant.longitud}
                                        name={restaurant.nombre}
                                        address={restaurant.direccion}
                                    />
                                </MapProvider>
                            )
                        } else {
                            console.warn('⚠️ Coordenadas inválidas:', {
                                latitud: restaurant.latitud,
                                longitud: restaurant.longitud,
                                nombre: restaurant.nombre
                            })
                            return (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                                    <p>Ubicación no disponible</p>
                                    <p style={{ fontSize: '12px', marginTop: '10px' }}>
                                        Las coordenadas recibidas no son válidas.
                                    </p>
                                    {restaurant.direccion && (
                                        <p style={{ fontSize: '14px', marginTop: '10px' }}>
                                            Dirección: {restaurant.direccion}
                                        </p>
                                    )}
                                </div>
                            )
                        }
                    })()}
                </div>
            </section>
            <section className={styles.rating} id="opiniones">
                <RatingDistribution
                    data={{
                        excelente: 10,
                        bueno: 7,
                        promedio: 5,
                        malo: 2,
                        horrible: 1,
                    }}
                    rating={rating}
                />
                <div className={styles.rating__div}>
                    <h4 className={styles.rating__title}>Opinión</h4>
                    <button 
                        className={styles.rating__button}
                        onClick={() => setShowReviewModal(true)}
                    >
                        <FontAwesomeIcon
                            className={styles.rating__icon}
                            icon={faPen}
                        />
                        Escribir una opinión
                    </button>
                </div>
            </section>
            <section className={styles.opinions}>
                <h3 className={styles.opinions__title}>
                    Todas las opiniones ({reviews.length})
                </h3>
                <p className={styles.opinions__text}>
                    Las opiniones son valoraciones subjetivas de miembros de{' '}
                    <span className={styles.opinions__brand}>Gusto!</span>
                </p>
                
                {restaurant.reviewsLocales && restaurant.reviewsLocales.length > 0 && (
                    <ReviewList reviews={restaurant.reviewsLocales} isLocal={true} />
                )}
                
                {restaurant.reviewsGoogle && restaurant.reviewsGoogle.length > 0 && (
                    <ReviewList reviews={restaurant.reviewsGoogle} isLocal={false} />
                )}
                
                {/* Fallback a reviews antiguas si no hay separadas */}
                {(!restaurant.reviewsLocales || restaurant.reviewsLocales.length === 0) &&
                 (!restaurant.reviewsGoogle || restaurant.reviewsGoogle.length === 0) && (
                    <ReviewList reviews={reviews} />
                )}
            </section>
            
            {showReviewModal && (
                <ReviewModal
                    restaurant={restaurant}
                    isOpen={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                />
            )}
        </main>
    )
}
