import styles from './page.module.css'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
    title: string
    subtitle: string
    children: React.ReactNode
    alt: {
        text: string
        link__url: string
        link__text: string
    }
}

export default function SocialAuth({ title, subtitle, children, alt }: Props) {
    return (
        <>
            <header className={styles.header}>
                <Image
                    src="/images/brand/gusto-center-negative.svg"
                    alt="Logo Gusto!"
                    className={styles.header__img}
                    width={0}
                    height={0}
                    priority
                />
                <h3 className={styles.header__subtitle}>{subtitle}</h3>
                <h2 className={styles.header__title}>{title}</h2>
            </header>
            {children}
            <div className={styles.alt}>
                <span className={styles.alt__span}>
                    {alt.text}{' '}
                    <Link href={alt.link__url} className={styles.alt__link}>
                        {alt.link__text}
                    </Link>
                </span>
            </div>
        </>
    )
}
