import { ROUTES } from '@/routes'
import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.css'

export default async function Home() {
    return (
        <>
            <header>
                <div>
                    <Image
                        src="/images/brand/gusto-center-negative.svg"
                        alt="Logo Gusto!"
                        className={styles.nav__img}
                        width={0}
                        height={0}
                        priority
                    />
                </div>
                <nav>
                    <Link href={`${ROUTES.HOME}/#inicio`}>Inicio</Link>
                    <Link href={`${ROUTES.HOME}/#beneficios`}>Beneficios</Link>
                    <Link href={`${ROUTES.HOME}/#faq`}>FAQ</Link>
                </nav>
                <div>
                    <button>REGÍSTRATE GRATIS</button>
                </div>
            </header>
            <main>
                <section id="inicio">
                    <div>
                        <h1>DONDE LOS GUSTOS COINCIDEN</h1>
                        <p>
                            GUSTO! REÚNE LAS PREFERENCIAS DE TU GRUPO Y CON IA
                            ENCUENTRA EL RESTAURANTE PERFECTO EN SEGUNDOS.
                            VOTEN, ORGANICEN LA SALIDA Y DISFRUTEN SIN PERDER
                            TIEMPO DISCUTIENDO.
                        </p>
                        <Link href={`${ROUTES.HOME}/#beneficios`}>Ver Más</Link>
                    </div>
                    <div></div>
                </section>
                <section id="carrusel"></section>
                <section id="beneficios">
                    <div>
                        <h2>BENEFICIOS DE ELEGIR GUSTO!</h2>
                        <p>
                            Hacemos que decidir dónde comer sea rápido, justo y
                            divertido. Nuestra inteligencia artificial analiza
                            los gustos, restricciones y preferencias de cada
                            persona del grupo para encontrar el lugar perfecto,
                            evitando discusiones y ahorrando tiempo.
                        </p>
                        <Link href={ROUTES.REGISTER}>
                            <button>PROBAR</button>
                        </Link>
                        <hr />
                        <div></div>
                    </div>
                    <div>
                        <div>
                            <h3>
                                RECOMENDACIONES <span>INTELIGENTES</span>
                            </h3>
                            <ul>
                                <li>
                                    Nuestro algoritmo analiza los gustos del
                                    grupo y encuentra el punto justo para todos.
                                </li>
                                <li>
                                    Un sistema inteligente que combina
                                    preferencias y restricciones para sugerirte
                                    el lugar ideal.
                                </li>
                                <li>
                                    Tu decisión guiada por datos, no
                                    discusiones. GUSTO! elige con vos.
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3>
                                OPCIONES <span>PERSONALIZADAS</span>
                            </h3>
                            <ul>
                                <li>
                                    Explorá lugares según tipo de comida,
                                    presupuesto o distancia.
                                </li>
                                <li>
                                    Todo a tu medida: filtrá por menú, estilo y
                                    ubicación.
                                </li>
                                <li>
                                    Recomendaciones pensadas según lo que te
                                    gusta (y lo que no).
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3>
                                DECISIONES MÁS <span>RÁPIDAS</span>
                            </h3>
                            <ul>
                                <li>
                                    Elegí dónde comer en minutos, sin perder
                                    tiempo debatiendo.
                                </li>
                                <li>
                                    Menos chat, más acción: decidí en segundos.
                                </li>
                                <li>
                                    Ahorra tiempo y energía: el algoritmo hace
                                    el trabajo por el grupo.
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3>
                                OPINIONES <span>REALES</span>
                            </h3>
                            <ul>
                                <li>
                                    Basado en experiencias reales de otros
                                    grupos como el tuyo.
                                </li>
                                <li>
                                    Descubrí lugares populares según reseñas
                                    auténticas.
                                </li>
                                <li>
                                    Recomendaciones impulsadas por la comunidad,
                                    no por publicidad.
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
                <section id="faq">
                    <div>
                        <h2>
                            PREGUNTAS <span>FRECUENTES</span>
                        </h2>
                    </div>
                    <div>
                        <details>
                            <summary>1. ¿Cómo funciona?</summary>
                            <div>
                                <p>
                                    Es muy simple: Cada integrante completa el
                                    “Step by Step” con sus preferencias.{' '}
                                    <strong>GUSTO!</strong> analiza los datos y
                                    genera un match de lugares ideales. El grupo
                                    elige el que más les guste. ¡Listo!{' '}
                                    <strong>
                                        Sin vueltas, sin debates eternos.
                                    </strong>
                                </p>
                            </div>
                        </details>
                        <details>
                            <summary>2. ¿Necesito crear una cuenta?</summary>
                            <div>
                                <p>
                                    Sí, para aprovechar el{' '}
                                    <strong>
                                        CORE de Machine Learning (ML)
                                    </strong>{' '}
                                    y todas las funciones sociales de{' '}
                                    <strong>GUSTO!</strong>, es necesario crear
                                    una cuenta. Al registrarte, puedes guardar
                                    tus gustos, restricciones alimentarias y, lo
                                    más importante, crear grupos y enviar
                                    solicitudes de amistad para empezar a
                                    organizar salidas.
                                </p>
                            </div>
                        </details>
                        <details>
                            <summary>3. ¿Cómo decide qué recomendar?</summary>
                            <div>
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
                                        gustos, tu historial y tus
                                        restricciones) para calcular un Score de
                                        Afinidad con miles de restaurantes.
                                    </li>
                                    <li>
                                        <strong>Decisión Grupal:</strong> Cuando
                                        estás en un grupo, la IA no solo te
                                        considera a ti; calcula la{' '}
                                        <strong>
                                            Máxima Satisfacción Colectiva
                                        </strong>
                                        . Esto significa que encuentra el lugar
                                        que mejor se adapta a la mayoría de los
                                        miembros, garantizando que sea seguro
                                        para aquellos con restricciones.
                                    </li>
                                </ul>
                                <p>
                                    La recomendación no se basa solo en
                                    popularidad, sino en una predicción de tu
                                    satisfacción personal y grupal.
                                </p>
                            </div>
                        </details>
                        <details>
                            <summary>
                                4. ¿Los restaurantes pueden aparecer en GUSTO!?
                            </summary>
                            <div>
                                <p>
                                    ¡Por supuesto! <strong>GUSTO!</strong> está
                                    abierto a que nuevos negocios se registren.
                                </p>
                                <ul>
                                    <li>
                                        Si eres dueño de un restaurante, puedes
                                        <strong>registrar tu local</strong> con
                                        todos los detalles clave: nombre,
                                        ubicación, coordenadas, platos y
                                        especialidades.
                                    </li>
                                    <li>
                                        Esto garantiza la{' '}
                                        <strong>visibilidad</strong> ante nuevos
                                        clientes que son perfectamente
                                        compatibles con tu oferta, gracias a los
                                        filtros de recomendación inteligente de
                                        nuestra plataforma.
                                    </li>
                                </ul>
                            </div>
                        </details>
                        <details>
                            <summary>5. ¿Está disponible en mi zona?</summary>
                            <div>
                                <p>
                                    Actualmente, <strong>GUSTO!</strong> está
                                    enfocado en el mercado{' '}
                                    <strong>argentino</strong>. Estamos
                                    trabajando para mapear y expandir
                                    rápidamente nuestra base de datos de
                                    restaurantes en las principales ciudades del
                                    país. Si no encuentras tu zona aún, te
                                    invitamos a registrarte para que podamos
                                    notificarte en cuanto la disponibilidad se
                                    expanda.
                                </p>
                            </div>
                        </details>
                        <details>
                            <summary>6. ¿Qué pasa con mis datos?</summary>
                            <div>
                                <p>Nos tomamos la privacidad muy en serio:</p>
                                <ul>
                                    <li>
                                        <strong>
                                            Preferencias y Restricciones:
                                        </strong>{' '}
                                        Tus datos de gustos y restricciones
                                        alimentarias (el input principal del ML)
                                        son tratados con la máxima
                                        confidencialidad. Se utilizan
                                        exclusivamente para{' '}
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
                                        <strong>Información Pública:</strong>{' '}
                                        Solo la información que tú decidas hacer
                                        pública (como tus reseñas en el foro o
                                        tus amistades) será visible para la
                                        comunidad.
                                    </li>
                                    <li>
                                        <strong>Compromiso:</strong> No
                                        compartimos tus datos personales con
                                        terceros. Nuestro negocio se basa en el
                                        valor de la{' '}
                                        <strong>
                                            recomendación inteligente
                                        </strong>
                                        , no en la venta de información
                                    </li>
                                </ul>
                            </div>
                        </details>
                    </div>
                </section>
            </main>
            <footer>
                <h3>EL PRÓXIMO PLAN, JUNTOS</h3>
                <div>
                    <div>
                        <p>CONTACTO</p>
                        <Link href="mailto:ejemplo@correo.com"></Link>
                    </div>
                    <div>
                        <Image
                            src="/images/brand/gusto-center-negative.svg"
                            alt="Logo Gusto!"
                            className={styles.nav__img}
                            width={0}
                            height={0}
                            priority
                        />
                    </div>
                    <div>
                        <p>REDES SOCIALES</p>
                        <Link href="https://www.instagram.com/"></Link>
                    </div>
                </div>
                <nav>
                    <Link href={`${ROUTES.HOME}/#inicio`}>Inicio</Link>
                    <Link href={`${ROUTES.HOME}/#beneficios`}>Beneficios</Link>
                    <Link href={`${ROUTES.HOME}/#faq`}>FAQ</Link>
                </nav>
            </footer>
        </>
    )
}
