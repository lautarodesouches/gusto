'use client'
import { ReactNode, useState, useRef, useEffect } from 'react'
import styles from './page.module.css'

type TooltipProps = {
    children: ReactNode
    text: string
    position?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
    delay?: number
    followCursor?: boolean
}

export default function Tooltip({
    children,
    text,
    position = 'auto',
    delay = 200,
    followCursor = false,
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)
    const [calculatedPosition, setCalculatedPosition] = useState(position)
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
    const containerRef = useRef<HTMLDivElement>(null)
    const bubbleRef = useRef<HTMLDivElement>(null)

    const calculateBestPosition = () => {
        if (!containerRef.current || !bubbleRef.current) return position

        const container = containerRef.current.getBoundingClientRect()
        const bubble = bubbleRef.current.getBoundingClientRect()
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight,
        }

        const spacing = 10
        const positions = {
            top: container.top - bubble.height - spacing,
            bottom: container.bottom + bubble.height + spacing,
            left: container.left - bubble.width - spacing,
            right: container.right + bubble.width + spacing,
        }

        // Si la posición es específica, verificar si cabe
        if (position !== 'auto') {
            const fits = {
                top: positions.top > 0,
                bottom: positions.bottom < viewport.height,
                left: positions.left > 0,
                right: positions.right < viewport.width,
            }

            if (fits[position]) return position
        }

        // Auto-detectar mejor posición
        const scores = {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
        }

        // Calcular espacio disponible
        if (positions.top > 0) scores.top = positions.top
        if (positions.bottom < viewport.height)
            scores.bottom = viewport.height - positions.bottom
        if (positions.left > 0) scores.left = positions.left
        if (positions.right < viewport.width)
            scores.right = viewport.width - positions.right

        // Verificar horizontalmente para top/bottom
        const horizontalFits =
            container.left + bubble.width / 2 > 0 &&
            container.right - bubble.width / 2 < viewport.width

        // Verificar verticalmente para left/right
        const verticalFits =
            container.top + bubble.height / 2 > 0 &&
            container.bottom - bubble.height / 2 < viewport.height

        // Priorizar top/bottom si caben horizontalmente
        if (horizontalFits) {
            if (scores.top > scores.bottom && scores.top > 0) return 'top'
            if (scores.bottom > 0) return 'bottom'
        }

        // Sino, usar left/right si caben verticalmente
        if (verticalFits) {
            if (scores.right > scores.left && scores.right > 0) return 'right'
            if (scores.left > 0) return 'left'
        }

        // Fallback a la posición con más espacio
        const maxScore = Math.max(...Object.values(scores))
        const bestPosition = Object.keys(scores).find(
            key => scores[key as keyof typeof scores] === maxScore
        ) as 'top' | 'bottom' | 'left' | 'right'

        return bestPosition || 'top'
    }

    const handleMouseEnter = () => {
        const id = setTimeout(() => {
            setIsVisible(true)
        }, delay)
        setTimeoutId(id)
    }

    const handleMouseLeave = () => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }
        setIsVisible(false)
        setCursorPosition({ x: 0, y: 0 })
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (followCursor && containerRef.current) {
            const container = containerRef.current.getBoundingClientRect()
            setCursorPosition({
                x: e.clientX - container.left,
                y: e.clientY - container.top,
            })
        }
    }

    useEffect(() => {
        if (isVisible && bubbleRef.current) {
            const newPosition = calculateBestPosition()
            setCalculatedPosition(newPosition)
        }
    }, [isVisible])

    const getBubbleStyle = () => {
        if (!followCursor) return {}

        return {
            '--cursor-x': `${cursorPosition.x}px`,
            '--cursor-y': `${cursorPosition.y}px`,
        } as React.CSSProperties
    }

    return (
        <div
            ref={containerRef}
            className={styles.tooltip}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
        >
            {children}
            {isVisible && (
                <div
                    ref={bubbleRef}
                    className={`${styles.tooltip__bubble} ${
                        styles[`tooltip__bubble--${calculatedPosition}`]
                    } ${followCursor ? styles['tooltip__bubble--cursor'] : ''}`}
                    style={getBubbleStyle()}
                >
                    {text}
                    <div className={styles.tooltip__arrow} />
                </div>
            )}
        </div>
    )
}

