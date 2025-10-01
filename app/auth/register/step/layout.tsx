'use client'
import { AuthProgress } from '@/components'
import { useState } from 'react'
import { useEffect } from 'react'

export default function Layout() {

    const [step, setStep] = useState(1)

    useEffect(() => {
        const interval = setInterval(() => {
            setStep(prev => prev < 4 ? prev + 1 : 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    return <>
        <AuthProgress activeStep={step} />
    </>
}