import { ROUTES } from '@/routes'
import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.css'
import { LandingFaq, LandingFooter, LandingHeader } from '@/components'

export default function Landing() {
    return (
        <main className={styles.main} id="inicio">
            <LandingHeader />
            <section className={styles.start}>
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
                            <span>Ver Más</span>
                        </button>
                    </Link>
                </div>
                <div className={styles.start__div}>
                    <Image
                        className={styles.start__img}
                        src="/images/all/poster.jpg"
                        alt="Grupo de personas comiendo"
                        width={600}
                        height={600}
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
                            <span>PROBAR</span>
                        </button>
                    </Link>
                    <hr className={styles.benefits__hr} />
                    <div className={styles.benefits__container}>
                        <Image
                            className={styles.benefits__img}
                            src="/images/all/beneficios.svg"
                            alt="Grupo de personas viendo celular"
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
                                src="/images/all/bot.svg"
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
                                src="/images/all/hamburguesa.svg"
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
                                src="/images/all/cronometro.svg"
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
                                src="/images/all/estrella.svg"
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
            <LandingFaq />
            <LandingFooter />
        </main>
    )
}
