'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

export function useStep() {
    const pathname = usePathname()

    const step = useMemo(() => {
        const last = pathname.split('/').pop() // "1", "2", "3"
        return parseInt(last || '1', 10)
    }, [pathname])

    return step
}
