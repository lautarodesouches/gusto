import { ActiveView } from '../Client'
import styles from './styles.module.css'

interface Props {
    activeView: ActiveView
    onClick: (view: ActiveView) => void
}

export default function Switch({ activeView, onClick }: Props) {
    return (
        <nav className={styles.switch}>
            <div
                className={`${styles.switch__slider} ${
                    activeView === 'map' ? styles['switch__slider--right'] : ''
                }`}
            ></div>
            <button
                className={styles.switch__button}
                onClick={() => onClick('chat')}
            >
                CHAT
            </button>
            <button
                className={styles.switch__button}
                onClick={() => onClick('map')}
            >
                MAPA
            </button>
        </nav>
    )
}
