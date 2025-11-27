'use client'
import Image from 'next/image'
import styles from './page.module.css'
import { Restaurant, Review } from '@/types'
import ReviewModal from '@/components/Review/Form/ReviewModal'
import RatingDistribution from '../Rating'
import ReviewList from '../Reviews'
import RestaurantMap from '../Map'
import { MapProvider } from '@/components/Map/MapProvider'
import { useEffect, useState, useRef } from 'react'
import { getRecomendacion } from '@/app/actions/restaurant'
import { parseHorarios, getEstadoActual, getRatingDistribution, getRatingLabel } from './utils'
import RestaurantHeader from './RestaurantHeader'
import RestaurantGallery from './RestaurantGallery'
import RestaurantInfo from './RestaurantInfo'

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
    const [showReviewModal, setShowReviewModal] = useState(false)
    
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

    const horarios = parseHorarios(restaurant)
    const estadoActual = getEstadoActual(restaurant, horarios)
    const rating = restaurant.rating ?? restaurant.valoracion ?? 0
    const ratingDistribution = getRatingDistribution(restaurant, reviews)

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

    const scrollToSection = (e: React.MouseEvent, id: string) => {
        e.preventDefault()
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <main className={styles.main}>
            <section className={styles.top}>
                <RestaurantHeader
                    restaurant={restaurant}
                    isFavourite={isFavourite}
                    onFavourite={onFavourite}
                    stars={stars}
                    rating={rating}
                />
                <RestaurantGallery restaurant={restaurant} />
            </section>
            
            <nav className={styles.navbar}>
                <ul className={styles.navbar__ul}>
                    <li className={`${styles.navbar__li} ${activeSection === 'descripcion' ? styles.navbar__li_active : ''}`}>
                        <a className={styles.navbar__link} href="#descripcion" onClick={(e) => scrollToSection(e, 'descripcion')}>
                            Descripcion General
                        </a>
                    </li>
                    {restaurant.esDeLaApp && (
                        <li className={`${styles.navbar__li} ${activeSection === 'horarios' ? styles.navbar__li_active : ''}`}>
                            <a className={styles.navbar__link} href="#horarios" onClick={(e) => scrollToSection(e, 'horarios')}>
                                Horarios
                            </a>
                        </li>
                    )}
                    <li className={`${styles.navbar__li} ${activeSection === 'ubicacion' ? styles.navbar__li_active : ''}`}>
                        <a className={styles.navbar__link} href="#ubicacion" onClick={(e) => scrollToSection(e, 'ubicacion')}>
                            Ubicación
                        </a>
                    </li>
                    <li className={`${styles.navbar__li} ${activeSection === 'opiniones' ? styles.navbar__li_active : ''}`}>
                        <a className={styles.navbar__link} href="#opiniones" onClick={(e) => scrollToSection(e, 'opiniones')}>
                            Opiniones
                        </a>
                    </li>
                </ul>
            </nav>

            <RestaurantInfo
                restaurant={restaurant}
                horarios={horarios}
                estadoActual={estadoActual}
                explicacion={explicacion}
                loadingExplicacion={loadingExplicacion}
            />

            <section className={styles.location} id="ubicacion">
                <h3 className={styles.location__title}>Ubicación</h3>
                <p className={styles.location__address}>{restaurant.direccion}</p>
                <div className={styles.location__map}>
                    <MapProvider>
                        <RestaurantMap
                            lat={restaurant.latitud}
                            lng={restaurant.longitud}
                            name={restaurant.nombre}
                        />
                    </MapProvider>
                </div>
            </section>

            <section className={styles.reviews} id="opiniones">
                <div className={styles.reviews__header}>
                    <h3 className={styles.reviews__title}>Opiniones</h3>
                    <button 
                        className={styles.reviews__button}
                        onClick={() => setShowReviewModal(true)}
                    >
                        Escribir una opinión
                    </button>
                </div>
                
                <RatingDistribution 
                    data={ratingDistribution} 
                    rating={rating}
                    ratingLabel={getRatingLabel(rating)}
                />
                
                <ReviewList 
                    reviews={
                        (restaurant.reviewsLocales && restaurant.reviewsLocales.length > 0) 
                            ? restaurant.reviewsLocales 
                            : (restaurant.reviewsGoogle && restaurant.reviewsGoogle.length > 0)
                                ? restaurant.reviewsGoogle
                                : reviews
                    } 
                />
            </section>

            {showReviewModal && (
                <ReviewModal
                    restaurant={restaurant}
                    isOpen={true}
                    onClose={() => setShowReviewModal(false)}
                />
            )}
        </main>
    )
}
