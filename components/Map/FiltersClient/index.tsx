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

    const [dishes, setDishes] = useState<FilterItem[]>(
        (filters.dishes || []).filter(f => f != null).map(f => ({ ...f, checked: false }))
    )
    const [ratings, setRatings] = useState<FilterItem[]>(
        (filters.ratings || []).filter(f => f != null).map(f => ({ ...f, checked: false }))
    )

    // Solo marcar los seleccionados desde la URL al montar
    useEffect(() => {
        const gustos = searchParams.get('gustos') || ''
        const rating = searchParams.get('rating') || ''

        const markSelected = (items: FilterItem[], selectedValue: string) =>
            items.filter(item => item != null).map(item => ({
                ...item,
                checked: item.value === selectedValue,
            }))

        isUpdatingFromUrlRef.current = true
        setDishes(prev => markSelected(prev, gustos))
        setRatings(prev => markSelected(prev, rating))
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
        if (!dishes || dishes.length === 0) return
        
        const selectedGusto = dishes.find(item => item && item.checked)?.value || ''
        const currentGusto = searchParams.get('gustos') || ''
        if (selectedGusto !== currentGusto) {
            updateUrlParam('gustos', selectedGusto || null)
        }
    }, [dishes, searchParams, updateUrlParam])

    useEffect(() => {
        if (isUpdatingFromUrlRef.current) return
        if (!ratings || ratings.length === 0) return
        
        const selectedRating = ratings.find(item => item && item.checked)?.value || ''
        const currentRating = searchParams.get('rating') || ''
        if (selectedRating !== currentRating) {
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
