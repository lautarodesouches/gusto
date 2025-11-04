'use client'
import styles from './styles.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons'

interface FilterItem {
    id: number
    name: string
    checked: boolean
}

interface FiltersProps {
    categories: FilterItem[]
    dishes: FilterItem[]
    ratings: FilterItem[]
}

interface Props {
    isVisible: boolean
    onClose: () => void
    filters: FiltersProps
    onCategoryClick: (name: string) => void
    onDishClick: (name: string) => void
    onRatingClick: (name: string) => void
}

export default function FiltersView({
    isVisible,
    onClose,
    filters,
    onCategoryClick,
    onDishClick,
    onRatingClick,
}: Props) {
    return (
        <section className={`${styles.filter} ${isVisible ? styles.show : ''}`}>
            <header className={styles.filter__header}>
                <h2 className={styles.filter__title}>Filtros</h2>
                <FontAwesomeIcon
                    icon={faClose}
                    className={styles.filter__close}
                    onClick={onClose}
                />
            </header>
            <div className={styles.filter__content}>
                <div className={styles.filter__div}>
                    <h3 className={styles.filter__category}>Tipo</h3>
                    <hr className={styles.filter__line} />
                    <ul className={styles.filter__list}>
                        {filters.categories.map(item => (
                            <li
                                className={styles.filter__item}
                                key={item.id}
                                onClick={() => onCategoryClick(item.name)}
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
                        {filters.dishes.map(item => (
                            <li
                                className={styles.filter__item}
                                key={item.id}
                                onClick={() => onDishClick(item.name)}
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
                        {filters.ratings.map(item => (
                            <li
                                className={styles.filter__item}
                                key={item.id}
                                onClick={() => onRatingClick(item.name)}
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
