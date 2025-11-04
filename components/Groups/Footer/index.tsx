'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './styles.module.css'
import {
    faMapLocationDot,
    faUserGroup,
} from '@fortawesome/free-solid-svg-icons'
import { ActiveView } from '../Client'

interface Props {
    activeView: ActiveView
    onClick: (view: ActiveView) => void
}

export default function Footer({ activeView, onClick }: Props) {
    return (
        <footer className={styles.footer}>
            <button
                className={
                    styles[
                        `footer__button${
                            activeView === 'home' ? '--active' : ''
                        }`
                    ]
                }
                onClick={() => onClick('home')}
            >
                <FontAwesomeIcon
                    className={styles.footer__icon}
                    icon={faMapLocationDot}
                />{' '}
                <span className={styles.footer__span}>Inicio</span>
            </button>
            <button
                className={
                    styles[
                        `footer__button${
                            activeView === 'chat' ? '--active' : ''
                        }`
                    ]
                }
                onClick={() => onClick('chat')}
            >
                <FontAwesomeIcon
                    className={styles.footer__icon}
                    icon={faUserGroup}
                />{' '}
                <span className={styles.footer__span}>Grupo</span>
            </button>
        </footer>
    )
}
