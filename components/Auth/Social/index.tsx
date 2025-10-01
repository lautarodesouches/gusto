import styles from './page.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faApple,
    faFacebookF,
    faGoogle,
} from '@fortawesome/free-brands-svg-icons'

interface Props {
    link: string
}

export default function SocialAuth({}: Props) {
    return (
        <div className={styles.icons}>
            <div className={styles.icons__div}>
                <FontAwesomeIcon
                    icon={faGoogle}
                    className={styles.icons__icon}
                />
            </div>
            <div className={styles.icons__div}>
                <FontAwesomeIcon
                    icon={faApple}
                    className={styles.icons__icon}
                />
            </div>
            <div className={styles.icons__div}>
                <FontAwesomeIcon
                    icon={faFacebookF}
                    className={styles.icons__icon}
                />
            </div>
        </div>
    )
}
