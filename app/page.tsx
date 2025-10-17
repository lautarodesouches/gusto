'use client'
import { ROUTES } from '@/routes'
import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faArrowUp,
    faBars,
    faChevronUp,
} from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'

export default function Home() {
    const [menuOpen, setMenuOpen] = useState(false)

    const toggleMenu = () => setMenuOpen(!menuOpen)

    return (
        <main className={styles.main}>
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
                    className={`${styles.header__container} ${
                        menuOpen ? styles.header__active : ''
                    }`}
                >
                    <nav className={styles.header__nav}>
                        <Link
                            className={styles.header__link}
                            href={`${ROUTES.HOME}/#`}
                        >
                            Inicio
                        </Link>
                        <Link
                            className={styles.header__link}
                            href={`${ROUTES.HOME}/#beneficios`}
                        >
                            Beneficios
                        </Link>
                        <Link
                            className={styles.header__link}
                            href={`${ROUTES.HOME}/#faq`}
                        >
                            FAQ
                        </Link>
                    </nav>
                    <div className={styles.header__bcontainer}>
                        <Link href={ROUTES.REGISTER}>
                            <button className={styles.header__button}>
                                REGÍSTRATE GRATIS
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
            <section className={styles.start} id="inicio">
                <div className={styles.start__div}>
                    <h1 className={styles.start__title}>
                        DONDE LOS GUSTOS COINCIDEN
                    </h1>
                    <p className={styles.start__text}>
                        GUSTO! REÚNE LAS PREFERENCIAS DE TU GRUPO Y CON IA
                        ENCUENTRA EL RESTAURANTE PERFECTO EN SEGUNDOS. VOTEN,
                        ORGANICEN LA SALIDA Y DISFRUTEN SIN PERDER TIEMPO
                        DISCUTIENDO.
                    </p>
                    <Link
                        className={styles.start__link}
                        href={`${ROUTES.HOME}/#beneficios`}
                    >
                        <button className={styles.start__button}>
                            Ver Más
                        </button>
                    </Link>
                </div>
                <div className={styles.start__div}>
                    <Image
                        className={styles.start__img}
                        src="/images/brand/gusto-center-negative.svg"
                        alt="Logo Gusto!"
                        width={0}
                        height={0}
                        priority
                    />
                </div>
            </section>
            <section className={styles.carrusel} id="carrusel"></section>
            <section className={styles.benefits} id="beneficios">
                <div className={styles.benefits__div}>
                    <h2 className={styles.benefits__title}>
                        BENEFICIOS DE ELEGIR <span>GUSTO</span>
                        <span>!</span>
                    </h2>
                    <p className={styles.benefits__text}>
                        Hacemos que decidir dónde comer sea rápido, justo y
                        divertido. Nuestra inteligencia artificial analiza los
                        gustos, restricciones y preferencias de cada persona del
                        grupo para encontrar el lugar perfecto, evitando
                        discusiones y ahorrando tiempo.
                    </p>
                    <Link
                        className={styles.benefits__link}
                        href={ROUTES.REGISTER}
                    >
                        <button className={styles.benefits__button}>
                            PROBAR
                        </button>
                    </Link>
                    <hr className={styles.benefits__hr} />
                    <div className={styles.benefits__container}>
                        <Image
                            className={styles.benefits__img}
                            src="/images/brand/gusto-center-negative.svg"
                            alt="Logo Gusto!"
                            width={0}
                            height={0}
                        />
                    </div>
                </div>
                <div className={styles.benefits__div}>
                    <article className={styles.benefit}>
                        <div className={styles.benefit__container}>
                            <Image
                                className={styles.benefit__icon}
                                src="/images/cursor/pointer-active-mini.png"
                                alt=""
                                width={0}
                                height={0}
                            />
                            <h3 className={styles.benefit__title}>
                                RECOMENDACIONES <span>INTELIGENTES</span>
                            </h3>
                        </div>
                        <ul className={styles.benefit__list}>
                            <li className={styles.benefit__item}>
                                Nuestro algoritmo analiza los gustos del grupo y
                                encuentra el punto justo para todos.
                            </li>
                            <li className={styles.benefit__item}>
                                Un sistema inteligente que combina preferencias
                                y restricciones para sugerirte el lugar ideal.
                            </li>
                            <li className={styles.benefit__item}>
                                Tu decisión guiada por datos, no discusiones.
                                GUSTO! elige con vos.
                            </li>
                        </ul>
                    </article>
                    <article className={styles.benefit}>
                        <div className={styles.benefit__container}>
                            <Image
                                className={styles.benefit__icon}
                                src="/images/cursor/pointer-active-mini.png"
                                alt=""
                                width={0}
                                height={0}
                            />
                            <h3 className={styles.benefit__title}>
                                OPCIONES <span>PERSONALIZADAS</span>
                            </h3>
                        </div>
                        <ul className={styles.benefit__list}>
                            <li className={styles.benefit__item}>
                                Explorá lugares según tipo de comida,
                                presupuesto o distancia.
                            </li>
                            <li className={styles.benefit__item}>
                                Todo a tu medida: filtrá por menú, estilo y
                                ubicación.
                            </li>
                            <li className={styles.benefit__item}>
                                Recomendaciones pensadas según lo que te gusta
                                (y lo que no).
                            </li>
                        </ul>
                    </article>
                    <article className={styles.benefit}>
                        <div className={styles.benefit__container}>
                            <Image
                                className={styles.benefit__icon}
                                src="/images/cursor/pointer-active-mini.png"
                                alt=""
                                width={0}
                                height={0}
                            />
                            <h3 className={styles.benefit__title}>
                                DECISIONES MÁS <span>RÁPIDAS</span>
                            </h3>
                        </div>
                        <ul className={styles.benefit__list}>
                            <li className={styles.benefit__item}>
                                Elegí dónde comer en minutos, sin perder tiempo
                                debatiendo.
                            </li>
                            <li className={styles.benefit__item}>
                                Menos chat, más acción: decidí en segundos.
                            </li>
                            <li className={styles.benefit__item}>
                                Ahorra tiempo y energía: el algoritmo hace el
                                trabajo por el grupo.
                            </li>
                        </ul>
                    </article>
                    <article className={styles.benefit}>
                        <div className={styles.benefit__container}>
                            <Image
                                className={styles.benefit__icon}
                                src="/images/cursor/pointer-active-mini.png"
                                alt=""
                                width={0}
                                height={0}
                            />
                            <h3 className={styles.benefit__title}>
                                OPINIONES <span>REALES</span>
                            </h3>
                        </div>
                        <ul className={styles.benefit__list}>
                            <li className={styles.benefit__item}>
                                Basado en experiencias reales de otros grupos
                                como el tuyo.
                            </li>
                            <li className={styles.benefit__item}>
                                Descubrí lugares populares según reseñas
                                auténticas.
                            </li>
                            <li className={styles.benefit__item}>
                                Recomendaciones impulsadas por la comunidad, no
                                por publicidad.
                            </li>
                        </ul>
                    </article>
                </div>
            </section>
            <section className={styles.faq} id="faq">
                <div className={styles.faq__div}>
                    <h2 className={styles.faq__title}>
                        PREGUNTAS <span>FRECUENTES</span>
                    </h2>
                    <Image
                        className={styles.faq__img}
                        src="/images/brand/gusto-center.svg"
                        alt=""
                        width={0}
                        height={0}
                    />
                </div>
                <div className={styles.faq__div}>
                    <details className={styles.faq__details} open>
                        <summary className={styles.faq__summary}>
                            <h4>1. ¿Cómo funciona?</h4>
                            <FontAwesomeIcon
                                icon={faChevronUp}
                                className={styles.faq__icon}
                            />
                        </summary>
                        <div className={styles.faq__content}>
                            <p>
                                Es muy simple: Cada integrante completa el “Step
                                by Step” con sus preferencias.{' '}
                                <strong>GUSTO!</strong> analiza los datos y
                                genera un match de lugares ideales. El grupo
                                elige el que más les guste. ¡Listo!{' '}
                                <strong>
                                    Sin vueltas, sin debates eternos.
                                </strong>
                            </p>
                        </div>
                    </details>
                    <details className={styles.faq__details}>
                        <summary className={styles.faq__summary}>
                            <h4>2. ¿Necesito crear una cuenta?</h4>
                            <FontAwesomeIcon
                                icon={faChevronUp}
                                className={styles.faq__icon}
                            />
                        </summary>
                        <div className={styles.faq__content}>
                            <p>
                                Sí, para aprovechar el{' '}
                                <strong>CORE de Machine Learning (ML)</strong> y
                                todas las funciones sociales de{' '}
                                <strong>GUSTO!</strong>, es necesario crear una
                                cuenta. Al registrarte, puedes guardar tus
                                gustos, restricciones alimentarias y, lo más
                                importante, crear grupos y enviar solicitudes de
                                amistad para empezar a organizar salidas.
                            </p>
                        </div>
                    </details>
                    <details className={styles.faq__details}>
                        <summary className={styles.faq__summary}>
                            <h4>3. ¿Cómo decide qué recomendar?</h4>
                            <FontAwesomeIcon
                                icon={faChevronUp}
                                className={styles.faq__icon}
                            />
                        </summary>
                        <div className={styles.faq__content}>
                            <p>
                                <strong>GUSTO!</strong> utiliza un avanzado
                                algoritmo de
                                <strong>Machine Learning (ML):</strong>
                            </p>
                            <ul>
                                <li>
                                    <strong>Análisis Predictivo:</strong> El
                                    algoritmo analiza tu{' '}
                                    <strong>perfil completo</strong> (tus
                                    gustos, tu historial y tus restricciones)
                                    para calcular un Score de Afinidad con miles
                                    de restaurantes.
                                </li>
                                <li>
                                    <strong>Decisión Grupal:</strong> Cuando
                                    estás en un grupo, la IA no solo te
                                    considera a ti; calcula la{' '}
                                    <strong>
                                        Máxima Satisfacción Colectiva
                                    </strong>
                                    . Esto significa que encuentra el lugar que
                                    mejor se adapta a la mayoría de los
                                    miembros, garantizando que sea seguro para
                                    aquellos con restricciones.
                                </li>
                            </ul>
                            <p>
                                La recomendación no se basa solo en popularidad,
                                sino en una predicción de tu satisfacción
                                personal y grupal.
                            </p>
                        </div>
                    </details>
                    <details className={styles.faq__details}>
                        <summary className={styles.faq__summary}>
                            <h4>
                                4. ¿Los restaurantes pueden aparecer en GUSTO!?
                            </h4>
                            <FontAwesomeIcon
                                icon={faChevronUp}
                                className={styles.faq__icon}
                            />
                        </summary>
                        <div className={styles.faq__content}>
                            <p>
                                ¡Por supuesto! <strong>GUSTO!</strong> está
                                abierto a que nuevos negocios se registren.
                            </p>
                            <ul>
                                <li>
                                    Si eres dueño de un restaurante, puedes
                                    <strong>registrar tu local</strong> con
                                    todos los detalles clave: nombre, ubicación,
                                    coordenadas, platos y especialidades.
                                </li>
                                <li>
                                    Esto garantiza la{' '}
                                    <strong>visibilidad</strong> ante nuevos
                                    clientes que son perfectamente compatibles
                                    con tu oferta, gracias a los filtros de
                                    recomendación inteligente de nuestra
                                    plataforma.
                                </li>
                            </ul>
                        </div>
                    </details>
                    <details className={styles.faq__details}>
                        <summary className={styles.faq__summary}>
                            <h4>5. ¿Está disponible en mi zona?</h4>
                            <FontAwesomeIcon
                                icon={faChevronUp}
                                className={styles.faq__icon}
                            />
                        </summary>
                        <div className={styles.faq__content}>
                            <p>
                                Actualmente, <strong>GUSTO!</strong> está
                                enfocado en el mercado{' '}
                                <strong>argentino</strong>. Estamos trabajando
                                para mapear y expandir rápidamente nuestra base
                                de datos de restaurantes en las principales
                                ciudades del país. Si no encuentras tu zona aún,
                                te invitamos a registrarte para que podamos
                                notificarte en cuanto la disponibilidad se
                                expanda.
                            </p>
                        </div>
                    </details>
                    <details className={styles.faq__details}>
                        <summary className={styles.faq__summary}>
                            <h4>6. ¿Qué pasa con mis datos?</h4>
                            <FontAwesomeIcon
                                icon={faChevronUp}
                                className={styles.faq__icon}
                            />
                        </summary>
                        <div className={styles.faq__content}>
                            <p>Nos tomamos la privacidad muy en serio:</p>
                            <ul>
                                <li>
                                    <strong>
                                        Preferencias y Restricciones:
                                    </strong>{' '}
                                    Tus datos de gustos y restricciones
                                    alimentarias (el input principal del ML) son
                                    tratados con la máxima confidencialidad. Se
                                    utilizan exclusivamente para{' '}
                                    <strong>
                                        mejorar la precisión de tus
                                        recomendaciones
                                    </strong>{' '}
                                    y para{' '}
                                    <strong>
                                        garantizar la seguridad alimentaria
                                    </strong>{' '}
                                    de tu grupo.
                                </li>
                                <li>
                                    <strong>Información Pública:</strong> Solo
                                    la información que tú decidas hacer pública
                                    (como tus reseñas en el foro o tus
                                    amistades) será visible para la comunidad.
                                </li>
                                <li>
                                    <strong>Compromiso:</strong> No compartimos
                                    tus datos personales con terceros. Nuestro
                                    negocio se basa en el valor de la{' '}
                                    <strong>recomendación inteligente</strong>,
                                    no en la venta de información
                                </li>
                            </ul>
                        </div>
                    </details>
                </div>
            </section>
            <footer className={styles.footer}>
                <h3 className={styles.footer__title}>
                    EL PRÓXIMO PLAN, <span>JUNTOS</span>
                </h3>
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
                        >
                            Instagram
                        </Link>
                    </div>
                </div>
                <nav className={styles.footer__nav}>
                    <Link
                        className={styles.footer__a}
                        href={`${ROUTES.HOME}/#`}
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
                    <Link
                        className={styles.footer__a}
                        href={`${ROUTES.HOME}/#faq`}
                    >
                        FAQ
                        <FontAwesomeIcon
                            className={styles.footer__icon}
                            icon={faArrowUp}
                        />
                    </Link>
                </nav>
            </footer>
        </main>
    )
}
