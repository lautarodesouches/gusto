'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './page.module.css'
import { faClose } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUpdateUrlParam } from '@/hooks/useUpdateUrlParam'

interface Props {
    isVisible: boolean
    handleClose: () => void
}

function handleSingleSelect<T extends { name: string; checked: boolean }>(
    name: string,
    setState: React.Dispatch<React.SetStateAction<T[]>>,
    paramKey: string,
    updateUrlParam: (key: string, value: string | null) => void
) {
    setState(prev => {
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

export default function Filter({ isVisible, handleClose }: Props) {
    const router = useRouter()
    const updateUrlParam = useUpdateUrlParam()
    const searchParams = useSearchParams()

    const [categories, setCategories] = useState([
        { name: 'Italiana', checked: true },
        { name: 'Japonesa', checked: false },
        { name: 'Parrilla', checked: false },
        { name: 'Mexicana', checked: false },
        { name: 'China', checked: false },
        { name: 'Vegana', checked: false },
        { name: 'Vegetariana', checked: false },
        { name: 'Rápida', checked: false },
        { name: 'Mediterránea', checked: false },
    ])

    const [dishes, setDishes] = useState([
        { name: 'Pizza', checked: true },
        { name: 'Sushi', checked: false },
        { name: 'Hamburguesas', checked: false },
        { name: 'Pasta', checked: false },
        { name: 'Ensaladas', checked: false },
        { name: 'Postres', checked: false },
    ])

    const [ratings, setRatings] = useState([
        { name: '4.0', checked: false },
        { name: '4.5', checked: true },
        { name: '5.0', checked: false },
    ])

    const handleCategoryClick = (name: string) =>
        handleSingleSelect(name, setCategories, 'tipo', updateUrlParam)

    const handleDishClick = (name: string) =>
        handleSingleSelect(name, setDishes, 'plato', updateUrlParam)

    const handleRatingClick = (name: string) =>
        handleSingleSelect(name, setRatings, 'rating', updateUrlParam)

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())

        const tipo = searchParams.get('tipo') || 'Italiana'
        const plato = searchParams.get('plato') || 'Pasta'
        const rating = searchParams.get('rating') || '4.0'

        if (!searchParams.get('tipo')) params.set('tipo', tipo)
        if (!searchParams.get('plato')) params.set('plato', plato)
        if (!searchParams.get('rating')) params.set('rating', rating)

        router.replace(`?${params.toString()}`, { scroll: false })

        // marcar los seleccionados
        setCategories(prev =>
            prev.map(c => ({ ...c, checked: c.name === tipo }))
        )
        setDishes(prev => prev.map(d => ({ ...d, checked: d.name === plato })))
        setRatings(prev =>
            prev.map(r => ({ ...r, checked: r.name === rating }))
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <section className={`${styles.filter} ${isVisible ? styles.show : ''}`}>
            <header className={styles.filter__header}>
                <h2 className={styles.filter__title}>Filtros</h2>
                <FontAwesomeIcon
                    icon={faClose}
                    className={styles.filter__close}
                    onClick={handleClose}
                />
            </header>
            <div className={styles.filter__content}>
                <div className={styles.filter__div}>
                    <h3 className={styles.filter__category}>Tipo</h3>
                    <hr className={styles.filter__line} />
                    <ul className={styles.filter__list}>
                        {categories.map((item, index) => (
                            <li
                                className={styles.filter__item}
                                key={index}
                                onClick={() => handleCategoryClick(item.name)}
                            >
                                <input
                                    type="checkbox"
                                    checked={item.checked}
                                    readOnly
                                    className={styles.filter__input}
                                />
                                <span className={styles.checkmark}></span>
                                <span className={styles.filter__span}>
                                    {item.name}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={styles.filter__div}>
                    <h3 className={styles.filter__category}>Platos</h3>
                    <hr className={styles.filter__line} />
                    <ul className={styles.filter__list}>
                        {dishes.map((item, index) => (
                            <li
                                className={styles.filter__item}
                                key={index}
                                onClick={() => handleDishClick(item.name)}
                            >
                                <input
                                    type="checkbox"
                                    checked={item.checked}
                                    readOnly
                                    className={styles.filter__input}
                                />
                                <span className={styles.checkmark}></span>
                                <span className={styles.filter__span}>
                                    {item.name}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={styles.filter__div}>
                    <h3 className={styles.filter__category}>Valoración</h3>
                    <hr className={styles.filter__line} />
                    <ul className={styles.filter__list}>
                        {ratings.map((item, index) => (
                            <li
                                className={styles.filter__item}
                                key={index}
                                onClick={() => handleRatingClick(item.name)}
                            >
                                <input
                                    type="checkbox"
                                    checked={item.checked}
                                    readOnly
                                    className={styles.filter__input}
                                />
                                <span className={styles.checkmark}></span>
                                <span className={styles.filter__span}>
                                    {item.name}+
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    )
}
