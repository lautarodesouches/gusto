'use client'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import styles from './page.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ROUTES } from '@/routes'
import Link from 'next/link'
import type { Ref, MouseEvent } from 'react'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'

export default function Footer() {
    const [ref, isVisible] = useIntersectionObserver({
        threshold: 0.2,
        rootMargin: '-50px',
    })

    const handleGoToTop = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        const main = document.getElementById('inicio')
        if (main) main.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <footer className={styles.footer}>
            <div className={styles.footer__top}>
                <h3
                    className={`${styles.footer__title} ${
                        isVisible ? styles.write : ''
                    }`}
                    ref={
                        typeof ref === 'boolean'
                            ? null
                            : (ref as Ref<HTMLHeadingElement>)
                    }
                >
                    EL PRÓXIMO PLAN, <span>JUNTOS</span>
                </h3>
            </div>
            <div className={styles.footer__container}>
                <div className={styles.footer__div}>
                    <p className={styles.footer__text}>CONTACTO</p>
                    <Link
                        className={styles.footer__link}
                        href="mailto:ejemplo@correo.com"
                    >
                        ejemplo@correo.com
                    </Link>
                </div>
                <div className={styles.footer__div}>
                    <Image
                        className={styles.footer__img}
                        src="/images/brand/gusto-center-negative.svg"
                        alt="Logo Gusto!"
                        width={0}
                        height={0}
                    />
                </div>
                <div className={styles.footer__div}>
                    <p className={styles.footer__text}>REDES SOCIALES</p>
                    <Link
                        className={styles.footer__link}
                        href="https://www.instagram.com/"
                        target="_blank"
                    >
                        Instagram
                    </Link>
                </div>
            </div>
            <nav className={styles.footer__nav}>
                <Link
                    className={styles.footer__a}
                    href={`${ROUTES.HOME}/#inicio`}
                    scroll={true}
                    onClick={handleGoToTop}
                >
                    Inicio
                    <FontAwesomeIcon
                        className={styles.footer__icon}
                        icon={faArrowUp}
                    />
                </Link>
                <Link
                    className={styles.footer__a}
                    href={`${ROUTES.HOME}/#beneficios`}
                >
                    Beneficios
                    <FontAwesomeIcon
                        className={styles.footer__icon}
                        icon={faArrowUp}
                    />
                </Link>
                <Link className={styles.footer__a} href={`${ROUTES.HOME}/#faq`}>
                    FAQ
                    <FontAwesomeIcon
                        className={styles.footer__icon}
                        icon={faArrowUp}
                    />
                </Link>
            </nav>
        </footer>
    )
}
