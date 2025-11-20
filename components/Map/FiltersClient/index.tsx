'use client'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import FiltersView from '../FiltersView'
import { useUpdateUrlParam } from '@/hooks/useUpdateUrlParam'
import { Filter, Filters } from '@/types'

export type FilterType = 'tipo' | 'gustos' | 'rating'

export interface FilterItem extends Filter {
    checked: boolean
}

interface Props {
    isVisible?: boolean
    filters: Filters
    onClose?: () => void
}

export default function FiltersClient({
    isVisible = true,
    onClose = () => {},
    filters,
}: Props) {
    const searchParams = useSearchParams()
    const updateUrlParam = useUpdateUrlParam()
    const isUpdatingFromUrlRef = useRef(false)
    const lastGustosUrlRef = useRef<string | null>(null)
    const lastRatingUrlRef = useRef<string | null>(null)
    const lastGustosStateRef = useRef<string | null>(null)
    const lastRatingStateRef = useRef<string | null>(null)

    const [dishes, setDishes] = useState<FilterItem[]>(
        filters.dishes.map(f => ({ ...f, checked: false }))
    )
    const [ratings, setRatings] = useState<FilterItem[]>(
        filters.ratings.map(f => ({ ...f, checked: false }))
    )

    // Sincronizar estado desde la URL cuando cambia
    useEffect(() => {
        const gustos = searchParams.get('gustos') || ''
        const rating = searchParams.get('rating') || ''

        // Solo actualizar si el valor en la URL realmente cambió
        const gustosChanged = gustos !== lastGustosUrlRef.current
        const ratingChanged = rating !== lastRatingUrlRef.current

        if (!gustosChanged && !ratingChanged) {
            return
        }

        lastGustosUrlRef.current = gustos
        lastRatingUrlRef.current = rating

        const markSelected = (items: FilterItem[], selectedValue: string) =>
            items.map(item => ({
                ...item,
                checked: item.value === selectedValue,
            }))

        isUpdatingFromUrlRef.current = true
        if (gustosChanged) {
            setDishes(prev => markSelected(prev, gustos))
            lastGustosStateRef.current = gustos
        }
        if (ratingChanged) {
            setRatings(prev => markSelected(prev, rating))
            lastRatingStateRef.current = rating
        }
        // Resetear la bandera después de un pequeño delay
        setTimeout(() => {
            isUpdatingFromUrlRef.current = false
        }, 0)
    }, [searchParams])

    // Función genérica para seleccionar un solo item
    const handleSingleSelect = (
        value: string,
        setItems: React.Dispatch<React.SetStateAction<FilterItem[]>>
    ) => {
        setItems(prev => {
            return prev.map(item => {
                const isSelected = item.value === value ? !item.checked : false
                return { ...item, checked: isSelected }
            })
        })
    }

    // Sincronizar cambios de estado con la URL (solo si no viene de la URL)
    useEffect(() => {
        if (isUpdatingFromUrlRef.current) return

        const selectedGusto = dishes.find(item => item.checked)?.value || ''
        const currentGusto = searchParams.get('gustos') || ''
        
        // Solo actualizar si el estado cambió y es diferente a lo que está en la URL
        if (selectedGusto !== lastGustosStateRef.current && selectedGusto !== currentGusto) {
            lastGustosStateRef.current = selectedGusto
            updateUrlParam('gustos', selectedGusto || null)
        }
    }, [dishes, searchParams, updateUrlParam])

    useEffect(() => {
        if (isUpdatingFromUrlRef.current) return
        
        const selectedRating = ratings.find(item => item.checked)?.value || ''
        const currentRating = searchParams.get('rating') || ''
        
        // Solo actualizar si el estado cambió y es diferente a lo que está en la URL
        if (selectedRating !== lastRatingStateRef.current && selectedRating !== currentRating) {
            lastRatingStateRef.current = selectedRating
            updateUrlParam('rating', selectedRating || null)
        }
    }, [ratings, searchParams, updateUrlParam])

    const handleDishClick = (value: string) =>
        handleSingleSelect(value, setDishes)
    const handleRatingClick = (value: string) =>
        handleSingleSelect(value, setRatings)

    return (
        <FiltersView
            isVisible={isVisible}
            onClose={onClose}
            filters={{ dishes, ratings }}
            onDishClick={handleDishClick}
            onRatingClick={handleRatingClick}
        />
    )
}
