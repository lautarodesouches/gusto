'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './page.module.css'
import { faClose } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useUpdateUrlParam } from '@/hooks/useUpdateUrlParam'

function handleMultiSelect<T extends { name: string; checked: boolean }>(
    name: string,
    setState: React.Dispatch<React.SetStateAction<T[]>>,
    paramKey: string,
    updateUrlParam: (key: string, value: string | null) => void
) {
    setState(prev => {
        const newState = prev.map(item =>
            item.name === name ? { ...item, checked: !item.checked } : item
        )

        // actualizar URL con todos los seleccionados
        const selected = newState
            .filter(item => item.checked)
            .map(item => item.name)
        updateUrlParam(paramKey, selected.length ? selected.join(',') : null)

        return newState
    })
}

export default function Filter() {
    const updateUrlParam = useUpdateUrlParam()
    const searchParams = useSearchParams()

    const [categories, setCategories] = useState([
        { name: 'Parrilla', checked: false },
        { name: 'Italiana', checked: false },
        { name: 'Sushi', checked: false },
        { name: 'Rápida', checked: false },
        { name: 'Café', checked: false },
    ])

    const [dishes, setDishes] = useState([
        { name: 'Pizza', checked: false },
        { name: 'Pasta', checked: false },
        { name: 'Asado', checked: false },
        { name: 'Hamburguesa', checked: false },
        { name: 'Sushi', checked: false },
        { name: 'Empanadas', checked: false },
        { name: 'Pollo frito', checked: false },
        { name: 'Ensalada cesar', checked: false },
        { name: 'Tostado', checked: false },
        { name: 'Helado', checked: false },
    ])

    const [ratings, setRatings] = useState([
        { name: '4.0', checked: false },
        { name: '4.5', checked: false },
        { name: '5.0', checked: false },
    ])

    const handleCategoryClick = (name: string) =>
        handleMultiSelect(name, setCategories, 'tipo', updateUrlParam)

    const handleDishClick = (name: string) =>
        handleMultiSelect(name, setDishes, 'plato', updateUrlParam)

    const handleRatingClick = (name: string) =>
        handleMultiSelect(name, setRatings, 'rating', updateUrlParam)

    useEffect(() => {
        const tipo = (searchParams.get('tipo') || '').split(',')
        const plato = (searchParams.get('plato') || '').split(',')
        const rating = (searchParams.get('rating') || '').split(',')

        setCategories(prev =>
            prev.map(c => ({ ...c, checked: tipo.includes(c.name) }))
        )
        setDishes(prev =>
            prev.map(d => ({ ...d, checked: plato.includes(d.name) }))
        )
        setRatings(prev =>
            prev.map(r => ({ ...r, checked: rating.includes(r.name) }))
        )
    }, [searchParams])

    return (
        <section className={styles.filter}>
            <header className={styles.filter__header}>
                <h2 className={styles.filter__title}>Filtros</h2>
                <FontAwesomeIcon
                    icon={faClose}
                    className={styles.filter__close}
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
