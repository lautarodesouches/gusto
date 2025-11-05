'use client'
import { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import styles from './page.module.css'

type SelectProps = {
    name: string
    placeholder: string
    options: string[]
    value: string[]
    onChange: (name: string, value: string[]) => void
    multiple?: boolean
}

export default function Select({
    name,
    placeholder,
    options,
    value,
    onChange,
    multiple = false,
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () =>
            document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleToggle = () => {
        setIsOpen(!isOpen)
    }

    const handleSelect = (option: string) => {
        if (multiple) {
            const newValue = value.includes(option)
                ? value.filter(v => v !== option)
                : [...value, option]
            onChange(name, newValue)
        } else {
            onChange(name, [option])
            setIsOpen(false)
        }
    }

    const displayValue = value.length > 0 ? value.join(', ') : placeholder

    return (
        <div className={styles.select} ref={containerRef}>
            <div
                className={`${styles.select__trigger} ${
                    isOpen ? styles['select__trigger--active'] : ''
                }`}
                onClick={handleToggle}
            >
                <span className={styles.select__value}>{displayValue}</span>
                <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`${styles.select__icon} ${
                        isOpen ? styles['select__icon--rotated'] : ''
                    }`}
                />
            </div>
            {isOpen && (
                <div className={styles.select__dropdown}>
                    {options.map(option => (
                        <div
                            key={option}
                            className={`${styles.select__option} ${
                                value.includes(option)
                                    ? styles['select__option--selected']
                                    : ''
                            }`}
                            onClick={() => handleSelect(option)}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
