// hooks/useIntersectionObserver.js
'use client'
import { useState, useEffect, useRef } from 'react'

export const useIntersectionObserver = (options = {}) => {
    const [isIntersecting, setIsIntersecting] = useState(false)
    const [hasAnimated, setHasAnimated] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setIsIntersecting(true)
                    setHasAnimated(true)
                }
            },
            {
                threshold: 0.1,
                ...options,
            }
        )

        const currentRef = ref.current
        if (currentRef) {
            observer.observe(currentRef)
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef)
            }
        }
    }, [options, hasAnimated])

    return [ref, isIntersecting]
}
