'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './page.module.css'
import { faClose } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'

interface Props {
    isVisible: boolean
    handleClose: () => void
}

export default function Filter({ isVisible, handleClose }: Props) {
    const [categories, setCategories] = useState([
        { name: 'Italiana', checked: true },
        { name: 'Japonesa', checked: false },
        { name: 'Parrilla', checked: true },
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
        { name: 'Hamburguesas', checked: true },
        { name: 'Pasta', checked: false },
        { name: 'Ensaladas', checked: false },
        { name: 'Postres', checked: false },
    ])

    const [ratings, setRatings] = useState([
        { name: '4.0', checked: true },
        { name: '4.5', checked: true },
        { name: '5.0', checked: true },
    ])

    const handleCategoryClick = (name: string) => {
        setCategories(prev =>
            prev.map(cat =>
                cat.name === name ? { ...cat, checked: !cat.checked } : cat
            )
        )
    }

    const handleDishClick = (name: string) => {
        setDishes(prev =>
            prev.map(cat =>
                cat.name === name ? { ...cat, checked: !cat.checked } : cat
            )
        )
    }

    const handleRatingClick = (name: string) => {
        setRatings(prev =>
            prev.map(cat =>
                cat.name === name ? { ...cat, checked: !cat.checked } : cat
            )
        )
    }

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
                                className={styles.filter__input}
                            />
                            <span>{item.name}</span>
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
                                className={styles.filter__input}
                            />
                            <span>{item.name}</span>
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
                                className={styles.filter__input}
                            />
                            <span>{item.name}+</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
