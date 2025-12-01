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
    onClose = () => { },
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
        (filters.dishes || []).filter(f => f != null).map(f => ({ ...f, checked: false }))
    )
    const [ratings, setRatings] = useState<FilterItem[]>(
        (filters.ratings || []).filter(f => f != null).map(f => ({ ...f, checked: false }))
    )

    // Sincronizar estado desde la URL cuando cambia
    useEffect(() => {
        const gustosParam = searchParams.get('gustos')
        const ratingParam = searchParams.get('rating')

        const gustos = gustosParam ? gustosParam.split(' ') : []
        const rating = ratingParam ? ratingParam.split(' ') : []

        // Convertir a string para comparar arrays fácilmente
        const gustosStr = JSON.stringify(gustos.sort())
        const ratingStr = JSON.stringify(rating.sort())

        // Solo actualizar si el valor en la URL realmente cambió
        const gustosChanged = gustosStr !== lastGustosUrlRef.current
        const ratingChanged = ratingStr !== lastRatingUrlRef.current

        if (!gustosChanged && !ratingChanged) {
            return
        }

        lastGustosUrlRef.current = gustosStr
        lastRatingUrlRef.current = ratingStr

        const markSelected = (items: FilterItem[], selectedValues: string[]) =>
            items.filter(item => item != null).map(item => ({
                ...item,
                checked: selectedValues.includes(item.value),
            }))

        isUpdatingFromUrlRef.current = true
        if (gustosChanged) {
            setDishes(prev => markSelected(prev, gustos))
            lastGustosStateRef.current = gustosStr
        }
        if (ratingChanged) {
            setRatings(prev => markSelected(prev, rating))
            lastRatingStateRef.current = ratingStr
        }
        // Resetear la bandera después de un pequeño delay
        setTimeout(() => {
            isUpdatingFromUrlRef.current = false
        }, 0)
    }, [searchParams])

    // Función genérica para seleccionar múltiples items
    const handleMultiSelect = (
        value: string,
        setItems: React.Dispatch<React.SetStateAction<FilterItem[]>>
    ) => {
        setItems(prev => {
            return prev.map(item => {
                if (item.value === value) {
                    return { ...item, checked: !item.checked }
                }
                return item
            })
        })
    }

    // Sincronizar cambios de estado con la URL (solo si no viene de la URL)
    useEffect(() => {
        if (isUpdatingFromUrlRef.current) return
        if (!dishes || dishes.length === 0) return

        const selectedGustos = dishes.filter(item => item && item.checked).map(item => item.value)
        const selectedGustosStr = JSON.stringify(selectedGustos.sort())

        // Solo actualizar si el estado cambió y es diferente a lo que está en la URL
        if (selectedGustosStr !== lastGustosStateRef.current) {
            lastGustosStateRef.current = selectedGustosStr
            updateUrlParam('gustos', selectedGustos.length > 0 ? selectedGustos : null)
        }
    }, [dishes, updateUrlParam])

    useEffect(() => {
        if (isUpdatingFromUrlRef.current) return
        if (!ratings || ratings.length === 0) return

        const selectedRatings = ratings.filter(item => item && item.checked).map(item => item.value)
        const selectedRatingsStr = JSON.stringify(selectedRatings.sort())

        // Solo actualizar si el estado cambió y es diferente a lo que está en la URL
        if (selectedRatingsStr !== lastRatingStateRef.current) {
            lastRatingStateRef.current = selectedRatingsStr
            updateUrlParam('rating', selectedRatings.length > 0 ? selectedRatings : null)
        }
    }, [ratings, updateUrlParam])

    // Función para seleccionar un único item (toggle)
    const handleSingleSelect = (
        value: string,
        setItems: React.Dispatch<React.SetStateAction<FilterItem[]>>
    ) => {
        setItems(prev => {
            return prev.map(item => {
                if (item.value === value) {
                    // Si ya estaba seleccionado, lo deseleccionamos (toggle off)
                    // Si no estaba seleccionado, lo seleccionamos
                    return { ...item, checked: !item.checked }
                }
                // Deseleccionar todos los demás
                return { ...item, checked: false }
            })
        })
    }

    const handleDishClick = (value: string) =>
        handleMultiSelect(value, setDishes)
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
