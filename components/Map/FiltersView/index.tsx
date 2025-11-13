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
            {/* Layout mobile */}
            <div className={styles.filter__mobile_layout}>
                <header className={styles.filter__header}>
                    <h2 className={styles.filter__title}>Gustos & Filtros</h2>
                    <button className={styles.filter__close_btn} onClick={onClose}>
                        <FontAwesomeIcon icon={faClose} />
                    </button>
                </header>
                <div className={styles.filter__content}>
                    <FilterSection
                        title="Tipo"
                        filters={filters.categories}
                        onItemClick={onCategoryClick}
                    />
                    <FilterSection
                        title="Gustos"
                        filters={filters.dishes}
                        onItemClick={onDishClick}
                    />
                    <FilterSection
                        title="Valoración"
                        filters={filters.ratings}
                        onItemClick={onRatingClick}
                    />
                </div>
            </div>

            {/* Layout desktop */}
            <div className={styles.filter__desktop_layout}>
                {/* Grid de 2 columnas */}
                <div className={styles.filtro__columnas_principales}>
                    <FilterSection
                        title="Tipo"
                        filters={filters.categories}
                        onItemClick={onCategoryClick}
                    />
                    <FilterSection
                        title="Gustos"
                        filters={filters.dishes}
                        onItemClick={onDishClick}
                    />
                </div>

                {/* Columna vertical de valoración a la derecha */}
                <div className={styles.filtro__columna_valoracion}>
                    <h3 className={styles.filtro__titulo_valoracion}>RATING</h3>
                    <div className={styles.filtro__opciones_valoracion}>
                        {filters.ratings.map(rating => (
                            <label
                                key={rating.id}
                                className={styles.filtro__item_valoracion}
                                onClick={() => onRatingClick(rating.value)}
                            >
                                <input
                                    type="checkbox"
                                    checked={rating.checked}
                                    readOnly
                                    className={styles.filtro__input_valoracion}
                                />
                                <span className={styles.filtro__checkmark_valoracion}></span>
                                <span className={styles.filtro__texto_valoracion}>{rating.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
