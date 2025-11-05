'use client'
import { useState, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage } from '@fortawesome/free-regular-svg-icons'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import styles from './page.module.css'

type ImageUploadProps = {
    label: string
    multiple?: boolean
    maxImages?: number
    sublabel?: string
}

export default function ImageUpload({
    label,
    multiple = false,
    maxImages = 1,
    sublabel,
}: ImageUploadProps) {
    const [images, setImages] = useState<string[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return

        const remainingSlots = maxImages - images.length
        if (remainingSlots <= 0) return

        const newImages: string[] = []
        const filesToProcess = multiple
            ? Array.from(files).slice(0, remainingSlots)
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

    const handleRemoveImage = (index: number, e: React.MouseEvent) => {
        e.stopPropagation()
        setImages(prev => prev.filter((_, idx) => idx !== index))
    }

    const handleClick = () => {
        if (images.length < maxImages) {
            fileInputRef.current?.click()
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        if (images.length < maxImages) {
            setIsDragging(true)
        }
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        handleFileSelect(e.dataTransfer.files)
    }

    const isFull = images.length >= maxImages

    return (
        <div className={styles.upload}>
            <span className={styles.upload__label}>{label}</span>
            {sublabel && (
                <span className={styles.upload__sublabel}>{sublabel}</span>
            )}
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
                            <div key={idx} className={styles.upload__imagecard}>
                                <img
                                    src={img}
                                    alt={`Preview ${idx}`}
                                    className={styles.upload__image}
                                />
                                <button
                                    type="button"
                                    className={styles.upload__delete}
                                    onClick={e => handleRemoveImage(idx, e)}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        ))}
                        {!isFull && (
                            <div className={styles.upload__addmore}>
                                <FontAwesomeIcon
                                    icon={faImage}
                                    className={styles.upload__addicon}
                                />
                                <span className={styles.upload__addtext}>
                                    Agregar más
                                </span>
                                <span className={styles.upload__counter}>
                                    {images.length}/{maxImages}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

