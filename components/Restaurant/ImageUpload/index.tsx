'use client'
import { useState, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage } from '@fortawesome/free-regular-svg-icons'
import styles from './page.module.css'

type ImageUploadProps = {
    label: string
    multiple?: boolean
    maxImages?: number
}

export default function ImageUpload({
    label,
    multiple = false,
    maxImages = 1,
}: ImageUploadProps) {
    const [images, setImages] = useState<string[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return

        const newImages: string[] = []
        const filesToProcess = multiple
            ? Array.from(files).slice(0, maxImages - images.length)
            : [files[0]]

        filesToProcess.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onload = e => {
                    if (e.target?.result) {
                        newImages.push(e.target.result as string)
                        if (newImages.length === filesToProcess.length) {
                            setImages(prev =>
                                multiple ? [...prev, ...newImages] : newImages
                            )
                        }
                    }
                }
                reader.readAsDataURL(file)
            }
        })
    }

    const handleClick = () => {
        fileInputRef.current?.click()
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        handleFileSelect(e.dataTransfer.files)
    }

    return (
        <div className={styles.upload}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple={multiple}
                onChange={e => handleFileSelect(e.target.files)}
                className={styles.upload__input}
            />
            <div
                className={`${styles.upload__area} ${
                    isDragging ? styles['upload__area--dragging'] : ''
                } ${images.length > 0 ? styles['upload__area--hasimages'] : ''}`}
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {images.length === 0 ? (
                    <>
                        <FontAwesomeIcon
                            icon={faImage}
                            className={styles.upload__icon}
                        />
                        <p className={styles.upload__text}>
                            Hazclick para agregar fotos
                        </p>
                        <p className={styles.upload__subtext}>
                            o arrastrar y sueltas
                        </p>
                    </>
                ) : (
                    <div className={styles.upload__preview}>
                        {images.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt={`Preview ${idx}`}
                                className={styles.upload__image}
                            />
                        ))}
                    </div>
                )}
            </div>
            <span className={styles.upload__label}>{label}</span>
        </div>
    )
}

