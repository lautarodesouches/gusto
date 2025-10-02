import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import styles from './page.module.css'

type InputFieldProps = {
    name: string
    type?: string
    placeholder?: string
    value: string
    error?: string
    icon?: IconDefinition
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function InputField({
    name,
    type = 'text',
    placeholder,
    value,
    error,
    icon,
    onChange,
}: InputFieldProps) {
    return (
        <div>
            <div className={styles.form__group}>
                {icon && (
                    <FontAwesomeIcon
                        icon={icon}
                        className={styles.form__icon}
                    />
                )}
                <input
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    className={styles.form__input}
                    value={value}
                    onChange={onChange}
                />
            </div>
            {error && <span className={styles.error}>* {error}</span>}
        </div>
    )
}
