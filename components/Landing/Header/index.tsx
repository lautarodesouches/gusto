'use client'
import { ROUTES } from '@/routes'
import { faBars, faClose } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import styles from './page.module.css'

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false)

    const toggleMenu = () => setMenuOpen(!menuOpen)

    return (
        <header className={styles.header}>
            <div className={styles.header__div}>
                <Image
                    className={styles.header__img}
                    src="/images/brand/gusto-no-slogan.svg"
                    alt="Logo Gusto!"
                    width={0}
                    height={0}
                    priority
                />
            </div>
            <div
                className={`${styles.header__container} ${menuOpen ? styles.header__active : ''
                    }`}
            >
                <FontAwesomeIcon
                    icon={faClose}
                    className={styles.header__close}
                    onClick={toggleMenu}
                />
                <nav className={styles.header__nav}>
                    <Link
                        className={styles.header__link}
                        href={`${ROUTES.HOME}/#`}
                        onClick={() => setMenuOpen(false)}
                    >
                        Inicio
                    </Link>
                    <Link
                        className={styles.header__link}
                        href={`${ROUTES.HOME}/#beneficios`}
                        onClick={() => setMenuOpen(false)}
                    >
                        Beneficios
                    </Link>
                    <Link
                        className={styles.header__link}
                        href={`${ROUTES.HOME}/#faq`}
                        onClick={() => setMenuOpen(false)}
                    >
                        FAQ
                    </Link>
                </nav>
                <div className={styles.header__bcontainer}>
                    <Link href={ROUTES.REGISTER__RESTAURANT}>
                        <button className={styles.header__buttonRes}>
                            <span>SOY LOCAL</span>
                        </button>
                    </Link>
                    <Link href={ROUTES.LOGIN}>
                        <button className={styles.header__button}>
                            <span>INGRESAR</span>
                        </button>
                    </Link>
                    <Link href={ROUTES.REGISTER}>
                        <button className={styles.header__button}>
                            <span>REGISTRARME</span>
                        </button>
                    </Link>
                </div>
            </div>
            <FontAwesomeIcon
                className={styles.header__icon}
                icon={faBars}
                onClick={toggleMenu}
            />
        </header>
    )
}
