import { ActiveView } from '../Client'
import styles from './styles.module.css'

interface Props {
    activeView: ActiveView
    onClick: (view: ActiveView) => void
    hideOnMobileHome?: boolean
}

export default function Switch({ activeView, onClick, hideOnMobileHome = false }: Props) {
    // En mobile, ocultar cuando está en home si hideOnMobileHome es true
    const shouldHide = hideOnMobileHome && activeView === 'home'
    
    return (
        <nav className={`${styles.switch} ${shouldHide ? styles['switch--hidden-mobile'] : ''}`}>
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
