/* eslint-disable @next/next/no-img-element */
'use client'
import { useState, useTransition, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'
import styles from './styles.module.css'
import { Restaurant } from '@/types'
import { useToast } from '@/context/ToastContext'
import { submitReview } from '@/app/actions/review'

interface ReviewFormProps {
    restaurant: Restaurant
}

const MONTHS = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
]

const VISIT_TYPES = [
    { id: 'negocio', label: 'Negocio' },
    { id: 'pareja', label: 'Pareja' },
    { id: 'familia', label: 'Familia' },
    { id: 'amigos', label: 'Amigos' },
    { id: 'solo', label: 'Solo' },
] as const

export default function ReviewForm({ restaurant }: ReviewFormProps) {
    const toast = useToast()

    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    
    // Manejar clic en estrella (entero o media)
    const handleStarClick = (starIndex: number, isHalf: boolean) => {
        const value = isHalf ? starIndex - 0.5 : starIndex
        setRating(value)
    }
    
    // Manejar hover en estrella
    const handleStarHover = (starIndex: number, isHalf: boolean) => {
        const value = isHalf ? starIndex - 0.5 : starIndex
        setHoverRating(value)
    }
    
    // Obtener el tipo de estrella a mostrar
    const getStarType = (starIndex: number, currentRating: number) => {
        if (currentRating >= starIndex) return 'full'
        if (currentRating >= starIndex - 0.5) return 'half'
        return 'empty'
    }
    const [visitDate, setVisitDate] = useState('')
    const [visitType, setVisitType] = useState<string>('')
    const [comment, setComment] = useState('')
    const [title, setTitle] = useState('')
    const [images, setImages] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const [agreed, setAgreed] = useState(false)

    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])

        if (files.length + images.length > 5) {
            toast.error('Máximo 5 fotos permitidas')
            return
        }

        setImages(prev => [...prev, ...files])

        // Crear previews
        files.forEach(file => {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result as string])
            }
            reader.readAsDataURL(file)
        })
    }

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index))
        setImagePreviews(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (rating === 0) {
            toast.error('Por favor selecciona una calificación')
            return
        }

        if (!agreed) {
            toast.error('Debes aceptar los términos para continuar')
            return
        }

        const formData = new FormData()
        formData.append('restaurantId', restaurant.id)
        formData.append('rating', rating.toString())
        formData.append('visitDate', visitDate)
        formData.append('visitType', visitType)
        formData.append('comment', comment)
        formData.append('title', title)

        images.forEach((image, index) => {
            formData.append(`image-${index}`, image)
        })

        startTransition(async () => {
            const result = await submitReview({ name: '', description: '' })

            toast.success('Opinion enviada')

            if (result.success) {
                toast.success('¡Opinión enviada exitosamente!')
                router.push(`/restaurante/${restaurant.id}`)
            } else {
                toast.error(result.error || 'Error al enviar opinión')
            }
        })
    }

    return (
        <main className={styles.reviewForm}>
            <div className={styles.reviewForm__container}>
                {/* Columna izquierda: Info del restaurante */}
                <aside className={styles.reviewForm__aside}>
                    <h1 className={styles.reviewForm__title}>
                        Contános:
                        <br />
                        ¿Cómo te fue
                        <br />
                        en tu visita?
                    </h1>

                    <div className={styles.reviewForm__card}>
                        <div className={styles.reviewForm__cardImage}>
                            {restaurant.imagenUrl ? (
                                <Image
                                    src={'/images/restaurant/main.png'}
                                    alt={restaurant.nombre}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            ) : (
                                <div
                                    className={
                                        styles.reviewForm__cardPlaceholder
                                    }
                                />
                            )}
                        </div>
                        <div className={styles.reviewForm__cardInfo}>
                            <h2 className={styles.reviewForm__cardTitle}>
                                {restaurant.nombre}
                            </h2>
                            <p className={styles.reviewForm__cardLocation}>
                                {restaurant.direccion}
                            </p>
                        </div>
                    </div>
                </aside>

                {/* Columna derecha: Formulario */}
                <form
                    className={styles.reviewForm__form}
                    onSubmit={handleSubmit}
                >
                    {/* Rating */}
                    <div className={styles.reviewForm__field}>
                        <label className={styles.reviewForm__label}>
                            ¿Cómo calificarías tu experiencia?
                        </label>
                        <div className={styles.reviewForm__stars}>
                            {[1, 2, 3, 4, 5].map(star => {
                                const displayRating = hoverRating || rating
                                const starType = getStarType(star, displayRating)
                                
                                // Determinar qué imagen mostrar
                                let starImage = '/images/all/star-empty.svg'
                                if (starType === 'full') {
                                    starImage = '/images/all/star.svg'
                                } else if (starType === 'half') {
                                    starImage = '/images/all/star-half.svg'
                                }
                                
                                return (
                                    <div
                                        key={star}
                                        className={styles.reviewForm__starContainer}
                                        onMouseLeave={() => setHoverRating(0)}
                                    >
                                        {/* Imagen de la estrella completa */}
                                        <Image
                                            src={starImage}
                                            alt={`${star} estrellas`}
                                            width={70}
                                            height={70}
                                            className={styles.reviewForm__starImage}
                                        />
                                        {/* Mitad izquierda clickeable (media estrella) */}
                                        <button
                                            type="button"
                                            className={styles.reviewForm__starHalf}
                                            onClick={() => handleStarClick(star, true)}
                                            onMouseEnter={() => handleStarHover(star, true)}
                                            aria-label={`${star - 0.5} estrellas`}
                                        />
                                        {/* Mitad derecha clickeable (estrella completa) */}
                                        <button
                                            type="button"
                                            className={`${styles.reviewForm__starHalf} ${styles.reviewForm__starHalfRight}`}
                                            onClick={() => handleStarClick(star, false)}
                                            onMouseEnter={() => handleStarHover(star, false)}
                                            aria-label={`${star} estrellas`}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Fecha de visita */}
                    <div className={styles.reviewForm__field}>
                        <label className={styles.reviewForm__label}>
                            ¿Cúando fuiste?
                        </label>
                        <select
                            className={styles.reviewForm__select}
                            value={visitDate}
                            onChange={e => setVisitDate(e.target.value)}
                            required
                        >
                            <option value="">Seleccionar mes y año</option>
                            {years.map(year =>
                                MONTHS.map((month, index) => (
                                    <option
                                        key={`${year}-${index}`}
                                        value={`${year}-${index + 1}`}
                                    >
                                        {month} {year}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Tipo de visita */}
                    <div className={styles.reviewForm__field}>
                        <label className={styles.reviewForm__label}>
                            ¿Con quién fuiste?
                        </label>
                        <div className={styles.reviewForm__buttons}>
                            {VISIT_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    type="button"
                                    className={`${styles.reviewForm__button} ${
                                        visitType === type.id
                                            ? styles[
                                                  'reviewForm__button--active'
                                              ]
                                            : ''
                                    }`}
                                    onClick={() => setVisitType(type.id)}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comentario */}
                    <div className={styles.reviewForm__field}>
                        <div className={styles.reviewForm__labelRow}>
                            <label className={styles.reviewForm__label}>
                                Escribe tu Opinión
                            </label>
                            <span className={styles.reviewForm__optional}>
                                Consejos para las reseñas
                            </span>
                        </div>
                        <textarea
                            className={styles.reviewForm__textarea}
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Cuéntanos sobre tu experiencia..."
                            maxLength={1000}
                            rows={6}
                            required
                        />
                        <span className={styles.reviewForm__counter}>
                            {comment.length}/1.000 caracteres mínimos
                        </span>
                    </div>

                    {/* Título */}
                    <div className={styles.reviewForm__field}>
                        <label className={styles.reviewForm__label}>
                            Título de tu opinión
                        </label>
                        <input
                            type="text"
                            className={styles.reviewForm__input}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Resume tu visita"
                            maxLength={50}
                            required
                        />
                        <span className={styles.reviewForm__counter}>
                            {title.length}/50 caracteres máximos
                        </span>
                    </div>

                    {/* Fotos */}
                    <div className={styles.reviewForm__field}>
                        <div className={styles.reviewForm__labelRow}>
                            <label className={styles.reviewForm__label}>
                                Agrega algunas fotos
                            </label>
                            <span className={styles.reviewForm__optional}>
                                Opcional
                            </span>
                        </div>

                        <div className={styles.reviewForm__upload}>
                            <input
                                type="file"
                                id="images"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className={styles.reviewForm__fileInput}
                            />
                            <label
                                htmlFor="images"
                                className={styles.reviewForm__uploadLabel}
                            >
                                <FontAwesomeIcon
                                    icon={faImage}
                                    className={styles.reviewForm__uploadIcon}
                                />
                                <span>Haz clic para agregar fotos</span>
                                <span className={styles.reviewForm__uploadHint}>
                                    o arrástralas y suéltalas
                                </span>
                            </label>
                        </div>

                        {imagePreviews.length > 0 && (
                            <div className={styles.reviewForm__previews}>
                                {imagePreviews.map((preview, index) => (
                                    <div
                                        key={index}
                                        className={styles.reviewForm__preview}
                                    >
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                        />
                                        <button
                                            type="button"
                                            className={
                                                styles.reviewForm__removeImage
                                            }
                                            onClick={() => removeImage(index)}
                                            aria-label="Eliminar imagen"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Checkbox */}
                    <div className={styles.reviewForm__checkbox}>
                        <input
                            type="checkbox"
                            id="agree"
                            checked={agreed}
                            onChange={e => setAgreed(e.target.checked)}
                            className={styles.reviewForm__checkboxInput}
                        />
                        <label
                            htmlFor="agree"
                            className={styles.reviewForm__checkboxLabel}
                        >
                            Certifico que esta opinión se basa en mi propia
                            experiencia y es mi opinión genuina de este
                            establecimiento, y que no tengo ninguna relación
                            personal ni comercial con este establecimiento, y no
                            se me ha ofrecido ningún incentivo o pago para
                            escribir esta opinión
                        </label>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className={styles.reviewForm__submit}
                        disabled={isPending || !agreed}
                    >
                        {isPending ? 'Enviando...' : 'Continuar'}
                    </button>
                </form>
            </div>
        </main>
    )
}
