import Image from 'next/image'
import styles from './page.module.css'

const IMAGE_SRC = '/images/all/carrusel.svg'

export default function LandingCarousel() {
    // Array de imágenes para renderizar más fácilmente
    const images = Array(6).fill(IMAGE_SRC)

    return (
        <section className={styles.carrusel}>
            <div className={styles.carousel__wrapper}>
                <div className={styles.carousel__track}>
                    {images.map((src, index) => (
                        <Image
                            key={`set1-${index}`}
                            src={src}
                            alt="Carrusel SVG"
                            width={800}
                            height={100}
                            className={styles.carousel__img}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
