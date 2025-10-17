'use client'
import { useState } from 'react'
import styles from './page.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronUp } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'

export default function FaqSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    const faqData = [
        {
            id: 1,
            question: '1. ¿Cómo funciona?',
            answer: (
                <p>
                    Es muy simple: Cada integrante completa el &quot;Step by
                    Step&quot; con sus preferencias. <strong>GUSTO!</strong>{' '}
                    analiza los datos y genera un match de lugares ideales. El
                    grupo elige el que más les guste. ¡Listo!{' '}
                    <strong>Sin vueltas, sin debates eternos.</strong>
                </p>
            ),
        },
        {
            id: 2,
            question: '2. ¿Necesito crear una cuenta?',
            answer: (
                <p>
                    Sí, para aprovechar el{' '}
                    <strong>CORE de Machine Learning (ML)</strong> y todas las
                    funciones sociales de <strong>GUSTO!</strong>, es necesario
                    crear una cuenta. Al registrarte, puedes guardar tus gustos,
                    restricciones alimentarias y, lo más importante, crear
                    grupos y enviar solicitudes de amistad para empezar a
                    organizar salidas.
                </p>
            ),
        },
        {
            id: 3,
            question: '3. ¿Cómo decide qué recomendar?',
            answer: (
                <>
                    <p>
                        <strong>GUSTO!</strong> utiliza un avanzado algoritmo de{' '}
                        <strong>Machine Learning (ML):</strong>
                    </p>
                    <ul>
                        <li>
                            <strong>Análisis Predictivo:</strong> El algoritmo
                            analiza tu <strong>perfil completo</strong> (tus
                            gustos, tu historial y tus restricciones) para
                            calcular un Score de Afinidad con miles de
                            restaurantes.
                        </li>
                        <li>
                            <strong>Decisión Grupal:</strong> Cuando estás en un
                            grupo, la IA no solo te considera a ti; calcula la{' '}
                            <strong>Máxima Satisfacción Colectiva</strong>. Esto
                            significa que encuentra el lugar que mejor se adapta
                            a la mayoría de los miembros, garantizando que sea
                            seguro para aquellos con restricciones.
                        </li>
                    </ul>
                    <p>
                        La recomendación no se basa solo en popularidad, sino en
                        una predicción de tu satisfacción personal y grupal.
                    </p>
                </>
            ),
        },
        {
            id: 4,
            question: '4. ¿Los restaurantes pueden aparecer en GUSTO!?',
            answer: (
                <>
                    <p>
                        ¡Por supuesto! <strong>GUSTO!</strong> está abierto a
                        que nuevos negocios se registren.
                    </p>
                    <ul>
                        <li>
                            Si eres dueño de un restaurante, puedes{' '}
                            <strong>registrar tu local</strong> con todos los
                            detalles clave: nombre, ubicación, coordenadas,
                            platos y especialidades.
                        </li>
                        <li>
                            Esto garantiza la <strong>visibilidad</strong> ante
                            nuevos clientes que son perfectamente compatibles
                            con tu oferta, gracias a los filtros de
                            recomendación inteligente de nuestra plataforma.
                        </li>
                    </ul>
                </>
            ),
        },
        {
            id: 5,
            question: '5. ¿Está disponible en mi zona?',
            answer: (
                <p>
                    Actualmente, <strong>GUSTO!</strong> está enfocado en el
                    mercado <strong>argentino</strong>. Estamos trabajando para
                    mapear y expandir rápidamente nuestra base de datos de
                    restaurantes en las principales ciudades del país. Si no
                    encuentras tu zona aún, te invitamos a registrarte para que
                    podamos notificarte en cuanto la disponibilidad se expanda.
                </p>
            ),
        },
        {
            id: 6,
            question: '6. ¿Qué pasa con mis datos?',
            answer: (
                <>
                    <p>Nos tomamos la privacidad muy en serio:</p>
                    <ul>
                        <li>
                            <strong>Preferencias y Restricciones:</strong> Tus
                            datos de gustos y restricciones alimentarias (el
                            input principal del ML) son tratados con la máxima
                            confidencialidad. Se utilizan exclusivamente para{' '}
                            <strong>
                                mejorar la precisión de tus recomendaciones
                            </strong>{' '}
                            y para{' '}
                            <strong>garantizar la seguridad alimentaria</strong>{' '}
                            de tu grupo.
                        </li>
                        <li>
                            <strong>Información Pública:</strong> Solo la
                            información que tú decidas hacer pública (como tus
                            reseñas en el foro o tus amistades) será visible
                            para la comunidad.
                        </li>
                        <li>
                            <strong>Compromiso:</strong> No compartimos tus
                            datos personales con terceros. Nuestro negocio se
                            basa en el valor de la{' '}
                            <strong>recomendación inteligente</strong>, no en la
                            venta de información.
                        </li>
                    </ul>
                </>
            ),
        },
    ]

    const toggleFaq = (index: number) => {
        setOpenIndex(prev => (prev === index ? null : index))
    }

    return (
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
                {faqData.map((faq, index) => (
                    <details
                        key={faq.id}
                        className={styles.faq__details}
                        open={openIndex === index}
                    >
                        <summary
                            className={styles.faq__summary}
                            onClick={e => {
                                e.preventDefault()
                                toggleFaq(index)
                            }}
                        >
                            <h4>{faq.question}</h4>
                            <FontAwesomeIcon
                                icon={faChevronUp}
                                className={`${styles.faq__icon} ${
                                    openIndex === index
                                        ? styles.faq__icon__rotated
                                        : ''
                                }`}
                            />
                        </summary>
                        {openIndex === index && (
                            <div className={styles.faq__content}>
                                {faq.answer}
                            </div>
                        )}
                    </details>
                ))}
            </div>
        </section>
    )
}
