'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import FiltersView from '../FiltersView'
import { useUpdateUrlParam } from '@/hooks/useUpdateUrlParam'
import { Filters } from '@/types'

interface FilterItem {
    id: number
    name: string
    checked: boolean
}

interface Props {
    isVisible?: boolean
    onClose?: () => void
    filters: Filters
}

export default function FiltersClient({
    isVisible = true,
    onClose = () => {},
    filters,
}: Props) {
    const searchParams = useSearchParams()
    const updateUrlParam = useUpdateUrlParam()

    // Inicializamos el estado agregando `checked: false`
    const [categories, setCategories] = useState<FilterItem[]>(
        filters.categories.map(f => ({ ...f, checked: false }))
    )
    const [dishes, setDishes] = useState<FilterItem[]>(
        filters.dishes.map(f => ({ ...f, checked: false }))
    )
    const [ratings, setRatings] = useState<FilterItem[]>(
        filters.ratings.map(f => ({ ...f, checked: false }))
    )

    // Solo marcar los seleccionados desde la URL al montar
    useEffect(() => {
        const tipo = searchParams.get('tipo') || ''
        const plato = searchParams.get('plato') || ''
        const rating = searchParams.get('rating') || ''

        const markSelected = (items: FilterItem[], selectedName: string) =>
            items.map(item => ({
                ...item,
                checked: item.name === selectedName,
            }))

        setCategories(prev => markSelected(prev, tipo))
        setDishes(prev => markSelected(prev, plato))
        setRatings(prev => markSelected(prev, rating))
    }, [searchParams])

    // Función genérica para seleccionar un solo item y actualizar URL
    const handleSingleSelect = (
        name: string,
        setItems: React.Dispatch<React.SetStateAction<FilterItem[]>>,
        paramKey: string
    ) => {
        setItems(prev => {
            let selected = ''
            const newState = prev.map(item => {
                const isSelected = item.name === name ? !item.checked : false
                if (isSelected) selected = item.name
                return { ...item, checked: isSelected }
            })
            updateUrlParam(paramKey, selected || null)
            return newState
        })
    }

    const handleCategoryClick = (name: string) =>
        handleSingleSelect(name, setCategories, 'tipo')
    const handleDishClick = (name: string) =>
        handleSingleSelect(name, setDishes, 'plato')
    const handleRatingClick = (name: string) =>
        handleSingleSelect(name, setRatings, 'rating')

    return (
        <FiltersView
            isVisible={isVisible}
            onClose={onClose}
            filters={{ categories, dishes, ratings }}
            onCategoryClick={handleCategoryClick}
            onDishClick={handleDishClick}
            onRatingClick={handleRatingClick}
        />
    )
}
