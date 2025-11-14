'use client'
import { useState, useEffect } from 'react'
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

    const [dishes, setDishes] = useState<FilterItem[]>(
        filters.dishes.map(f => ({ ...f, checked: false }))
    )
    const [ratings, setRatings] = useState<FilterItem[]>(
        filters.ratings.map(f => ({ ...f, checked: false }))
    )

    // Solo marcar los seleccionados desde la URL al montar
    useEffect(() => {
        const gustos = searchParams.get('gustos') || ''
        const rating = searchParams.get('rating') || ''

        const markSelected = (items: FilterItem[], selectedValue: string) =>
            items.map(item => ({
                ...item,
                checked: item.value === selectedValue,
            }))

        setDishes(prev => markSelected(prev, gustos))
        setRatings(prev => markSelected(prev, rating))
    }, [searchParams])

    // Función genérica para seleccionar un solo item y actualizar URL
    const handleSingleSelect = (
        value: string,
        setItems: React.Dispatch<React.SetStateAction<FilterItem[]>>,
        paramKey: string
    ) => {
        setItems(prev => {
            let selected = ''
            const newState = prev.map(item => {
                const isSelected = item.value === value ? !item.checked : false
                if (isSelected) selected = item.value
                return { ...item, checked: isSelected }
            })
            updateUrlParam(paramKey, selected || null)
            return newState
        })
    }

    const handleDishClick = (value: string) =>
        handleSingleSelect(value, setDishes, 'gustos')
    const handleRatingClick = (value: string) =>
        handleSingleSelect(value, setRatings, 'rating')

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
