import styles from './page.module.css'

interface Props {
    message: string
}

export default function Loading({ message }: Props) {
    return (
        <section className={styles.loadingContainer}>
            <aside className={styles.spinner}></aside>
            <p className={styles.loadingText}>{message}</p>
        </section>
    )
}
