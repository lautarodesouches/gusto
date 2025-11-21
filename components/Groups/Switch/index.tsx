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
    
    // Calcular posición del slider
    const getSliderPosition = () => {
        switch (activeView) {
            case 'chat':
                return styles['switch__slider--left']
            case 'map':
                return styles['switch__slider--center']
            case 'vote':
                return styles['switch__slider--right']
            default:
                return ''
        }
    }
    
    return (
        <nav className={`${styles.switch} ${shouldHide ? styles['switch--hidden-mobile'] : ''}`}>
            <div
                className={`${styles.switch__slider} ${getSliderPosition()}`}
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
            <button
                className={styles.switch__button}
                onClick={() => onClick('vote')}
            >
                VOTAR
            </button>
        </nav>
    )
}
