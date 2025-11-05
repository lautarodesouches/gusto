'use client'
import { useState } from 'react'
import styles from './page.module.css'
import { AuthInput } from '@/components'
import {
    RestaurantSelect,
    RestaurantTimeTable,
    RestaurantImageUpload,
} from '@/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

type FormData = {
    restaurantName: string
    email: string
    password: string
    confirmPassword: string
    website: string
    address: string
    restaurantType: string[]
    restrictions: string[]
    tastes: string[]
}

export default function RestaurantRegister() {
    const [formData, setFormData] = useState<FormData>({
        restaurantName: '',
        email: '',
        password: '',
        confirmPassword: '',
        website: '',
        address: '',
        restaurantType: [],
        restrictions: [],
        tastes: [],
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string[]) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Form submitted:', formData)
    }

    const restaurantTypes = [
        'Restaurante',
        'Cafetería',
        'Bar',
        'Comida Rápida',
        'Comida Casual',
        'Fine Dining',
        'Buffet',
        'Food Truck',
    ]

    const restrictionsOptions = [
        'Vegetariano',
        'Vegano',
        'Sin Gluten',
        'Kosher',
        'Halal',
        'Sin Lácteos',
        'Sin Frutos Secos',
    ]

    const tastesOptions = [
        'Italiana',
        'Mexicana',
        'China',
        'Japonesa',
        'Francesa',
        'Española',
        'India',
        'Árabe',
        'Peruana',
        'Argentina',
        'Americana',
        'Mediterránea',
    ]

    return (
        <div className={styles.page}>
            <header className={styles.page__header}>
                <div className={styles.page__brand}>
                    <span className={styles.page__logo}>GUSTO!</span>
                    <span className={styles.page__title}>Restaurante</span>
                </div>
                <button className={styles.page__button}>
                    Registrar Restaurante
                </button>
            </header>

            <form className={styles.page__form} onSubmit={handleSubmit}>
                <div className={styles.page__left}>
                    {/* Registro de Datos */}
                    <section className={styles.section}>
                        <h2 className={styles.section__title}>
                            Registro de <span>Datos</span>
                        </h2>
                        <div className={styles.section__content}>
                            <AuthInput
                                name="restaurantName"
                                type="text"
                                placeholder="nombre de Restaurante"
                                value={formData.restaurantName}
                                onChange={handleInputChange}
                            />
                            <AuthInput
                                name="email"
                                type="email"
                                placeholder="Correo electrónico"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                            <AuthInput
                                name="password"
                                type="password"
                                placeholder="Contraseña"
                                value={formData.password}
                                onChange={handleInputChange}
                                isPassword
                            />
                            <AuthInput
                                name="confirmPassword"
                                type="password"
                                placeholder="Repetir contraseña"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                isPassword
                            />
                        </div>
                    </section>

                    {/* Sobre el Restaurante */}
                    <section className={styles.section}>
                        <h2 className={styles.section__title}>
                            Sobre el <span>Restaurante</span>
                        </h2>
                        <div className={styles.section__content}>
                            <AuthInput
                                name="website"
                                type="url"
                                placeholder="Sitio web"
                                value={formData.website}
                                onChange={handleInputChange}
                            />
                            <RestaurantSelect
                                name="restaurantType"
                                placeholder="Selecciona el tipo de restaurante"
                                options={restaurantTypes}
                                value={formData.restaurantType}
                                onChange={handleSelectChange}
                            />
                            <RestaurantSelect
                                name="restrictions"
                                placeholder="Restricciones que Respeta"
                                options={restrictionsOptions}
                                value={formData.restrictions}
                                onChange={handleSelectChange}
                                multiple
                            />
                            <RestaurantSelect
                                name="tastes"
                                placeholder="Gustos que ofrece"
                                options={tastesOptions}
                                value={formData.tastes}
                                onChange={handleSelectChange}
                                multiple
                            />
                        </div>
                    </section>

                    {/* Horarios */}
                    <section className={styles.section}>
                        <h2 className={styles.section__title}>
                            Horarios de <span className={styles['section__title--green']}>Apertura</span> y <span>Cierre</span>
                        </h2>
                        <div className={styles.section__content}>
                            <RestaurantTimeTable />
                        </div>
                    </section>
                </div>

                <div className={styles.page__right}>
                    {/* Registro de Dirección */}
                    <section className={styles.section}>
                        <h2 className={styles.section__title}>
                            Registro de <span>Direccion</span>
                        </h2>
                        <div className={styles.section__content}>
                            <div className={styles.search}>
                                <FontAwesomeIcon
                                    icon={faSearch}
                                    className={styles.search__icon}
                                />
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Busca tu dirección"
                                    className={styles.search__input}
                                    value={formData.address}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className={styles.map}>
                                <div className={styles.map__container}>
                                    {/* Aquí iría la integración del mapa */}
                                    <div className={styles.map__placeholder}>
                                        Mapa interactivo
                                    </div>
                                </div>
                                <span className={styles.map__label}>
                                    Dirección Seleccionada
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Imágenes */}
                    <section className={styles.section}>
                        <div className={styles.images}>
                            <div className={styles.images__row}>
                                <RestaurantImageUpload
                                    label="Imagen"
                                    sublabel="Destacada"
                                    maxImages={1}
                                />
                                <RestaurantImageUpload
                                    label="Imagenes"
                                    sublabel="del Interior"
                                    multiple
                                    maxImages={5}
                                />
                            </div>
                            <div className={styles.images__row}>
                                <RestaurantImageUpload
                                    label="Imagenes"
                                    sublabel="de Comidas"
                                    multiple
                                    maxImages={5}
                                />
                                <RestaurantImageUpload
                                    label="Imagenes"
                                    sublabel="de Menu"
                                    multiple
                                    maxImages={5}
                                />
                            </div>
                            <div className={styles.images__single}>
                                <RestaurantImageUpload
                                    label="Logo"
                                    maxImages={1}
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </form>
        </div>
    )
}

