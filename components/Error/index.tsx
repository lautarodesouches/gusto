import styles from './page.module.css'

interface Props {
    message: string
}

export default function Error({ message }: Props) {
    return (
        <section className={styles.errorContainer}>
            <p>{message}</p>
        </section>
    )
}
