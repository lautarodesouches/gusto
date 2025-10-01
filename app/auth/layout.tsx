import styles from './page.module.css'

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <main className={styles.main}>
            <div className={styles.main__div}>{children}</div>
            <aside className={styles.main__aside}></aside>
        </main>
    )
}
