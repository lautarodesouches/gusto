'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './styles.module.css'
import {
    faMapLocationDot,
    faUserGroup,
} from '@fortawesome/free-solid-svg-icons'

interface Props {
    activeView: 'inicio' | 'grupo'
    onClick: (view: 'inicio' | 'grupo') => void
}

export default function Footer({ activeView, onClick }: Props) {
    return (
        <footer className={styles.footer}>
            <button
                className={
                    styles[
                        `footer__button${
                            activeView === 'inicio' ? '--active' : ''
                        }`
                    ]
                }
                onClick={() => onClick('inicio')}
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
                            activeView === 'grupo' ? '--active' : ''
                        }`
                    ]
                }
                onClick={() => onClick('grupo')}
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
