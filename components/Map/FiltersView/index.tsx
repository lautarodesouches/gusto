'use client'
import styles from './styles.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons'
import { FilterItem } from '../FiltersClient'

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

const FilterSection = ({
    title,
    filters,
    onItemClick,
}: {
    title: string
    filters: FilterItem[]
    onItemClick: (value: string) => void
}) => (
    <div className={styles.filter__div}>
        <h3 className={styles.filter__category}>{title}</h3>
        <hr className={styles.filter__line} />
        <ul className={styles.filter__list}>
            {filters.map(item => (
                <li
                    className={styles.filter__item}
                    key={item.id}
                    onClick={() => onItemClick(item.value)}
                >
                    <input
                        type="checkbox"
                        checked={item.checked}
                        readOnly
                        className={styles.filter__input}
                    />
                    <span className={styles.checkmark}></span>
                    <span className={styles.filter__span}>{item.name}</span>
                </li>
            ))}
        </ul>
    </div>
)

export default function FiltersView({
    isVisible,
    filters,
    onClose,
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
                <FilterSection
                    title="Tipo"
                    filters={filters.categories}
                    onItemClick={onCategoryClick}
                />
                <FilterSection
                    title="Platos"
                    filters={filters.dishes}
                    onItemClick={onDishClick}
                />
                <FilterSection
                    title="Valoración"
                    filters={filters.ratings}
                    onItemClick={onRatingClick}
                />
            </div>
        </section>
    )
}
