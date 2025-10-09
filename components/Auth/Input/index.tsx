'use client'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { faEye } from '@fortawesome/free-regular-svg-icons'
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import styles from './page.module.css'

type InputFieldProps = {
    name: string
    type?: string
    placeholder?: string
    value: string
    error?: string
    icon?: IconDefinition
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    isPassword?: boolean
}

export default function InputField({
    name,
    type = 'text',
    placeholder,
    value,
    error,
    icon,
    onChange,
    isPassword = false,
}: InputFieldProps) {
    const [showPassword, setShowPassword] = useState(false)

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
        <div className={styles.container}>
            {error && <span className={styles.error}>* {error}</span>}
            <div className={styles.form__group}>
                {icon && !isPassword && (
                    <FontAwesomeIcon
                        icon={icon}
                        className={styles.form__icon}
                    />
                )}
                <input
                    name={name}
                    type={inputType}
                    placeholder={placeholder}
                    className={styles.form__input}
                    value={value}
                    onChange={onChange}
                />
                {isPassword && (
                    <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                        className={styles.form__icon__toggle}
                        onClick={togglePasswordVisibility}
                    />
                )}
            </div>
        </div>
    )
}
