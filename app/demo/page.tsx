'use client'
import { AuthProgress, AuthStep } from '@/components'
import styles from './page.module.css'
import Image from 'next/image'
import { useState } from 'react'
import { RegisterProvider } from '@/context/RegisterContext'

const one = [
    {
        id: 1,
        nombre: 'Sin gluten',
    },
    {
        id: 2,
        nombre: 'Sin lactosa',
    },
    {
        id: 3,
        nombre: 'Sin azúcar',
    },
    {
        id: 4,
        nombre: 'Sin sal',
    },
    {
        id: 5,
        nombre: 'Sin mariscos',
    },
    {
        id: 6,
        nombre: 'Sin carne roja',
    },
    {
        id: 7,
        nombre: 'Sin frito',
    },
    {
        id: 8,
        nombre: 'Sin picante',
    },
    {
        id: 9,
        nombre: 'Sin cafeína',
    },
    {
        id: 10,
        nombre: 'Sin alcohol',
    },
    {
        id: 11,
        nombre: 'Sin soja',
    },
    {
        id: 12,
        nombre: 'Sin frutos secos',
    },
]

const two = [
    {
        id: 1,
        nombre: 'Diabetes',
    },
    {
        id: 2,
        nombre: 'Hipertensión',
    },
    {
        id: 3,
        nombre: 'Colesterol alto',
    },
    {
        id: 4,
        nombre: 'Gastritis',
    },
    {
        id: 5,
        nombre: 'Enfermedad celíaca',
    },
    {
        id: 6,
        nombre: 'Intolerancia a la lactosa',
    },
    {
        id: 7,
        nombre: 'Alergia a mariscos',
    },
    {
        id: 8,
        nombre: 'Alergia a frutos secos',
    },
    {
        id: 9,
        nombre: 'Alergia al huevo',
    },
    {
        id: 10,
        nombre: 'Síndrome del intestino irritable',
    },
]

const three = [
    { nombre: 'Pizza', id: 1 },
    { nombre: 'Pasta', id: 2 },
    { nombre: 'Asado', id: 3 },
    { nombre: 'Hamburguesa', id: 4 },
    { nombre: 'Sushi', id: 5 },
    { nombre: 'Empanadas', id: 6 },
    { nombre: 'Pollo frito', id: 7 },
    { nombre: 'Ensalada cesar', id: 8 },
    { nombre: 'Tostado', id: 9 },
    { nombre: 'Helado', id: 10 },
]

const Step1 = ({ onNext }: { onNext: () => void }) => (
    <AuthStep
        step={1}
        title="Alguna alergia o intolerancia?"
        description="Selecciona las que corresponden; son preferencias críticas"
        inputDescription="Escribe tus alergias o intolerancias"
        content={one}
        handleNext={onNext}
    />
)

const Step2 = ({
    onNext,
    onPrev,
}: {
    onNext: () => void
    onPrev: () => void
}) => (
    <AuthStep
        step={2}
        title="Condiciones médicas o dietas especiales"
        description="Información que afecta a las recomendaciones (ej: diabetes)"
        inputDescription="Escribe tus condiciones médicas o dietas"
        content={two}
        handleNext={onNext}
        handlePrev={onPrev}
    />
)

const Step3 = ({
    onNext,
    onPrev,
}: {
    onNext: () => void
    onPrev: () => void
}) => (
    <AuthStep
        step={3}
        title="Que te gusta comer?"
        description="Seleccioná hasta 5 tipos de cocina o platos que prefieras (podés agregar otros)"
        inputDescription="Escribe una comida"
        content={three}
        handlePrev={onPrev}
        handleNext={onNext}
    />
)

export default function Demo() {
    const [step, setStep] = useState(1) // paso inicial

    const handleNext = () => {
        setStep(prev => Math.min(prev + 1, 3)) // máximo step 3
    }

    const handlePrev = () => {
        setStep(prev => Math.max(prev - 1, 1)) // mínimo step 1
    }

    const handleClick = (newStep: number) => {
        setStep(newStep)
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return <Step1 onNext={handleNext} />
            case 2:
                return <Step2 onNext={handleNext} onPrev={handlePrev} />
            case 3:
                return <Step3 onNext={handleNext} onPrev={handlePrev} />
            default:
                return null
        }
    }

    return (
        <RegisterProvider>
            <div className={`${styles.wrapper} step-layout`}>
                <header className={styles.header}>
                    <Image
                        src="/images/brand/gusto-center-negative.svg"
                        alt="Logo Gusto!"
                        className={styles.logo}
                        width={120}
                        height={40}
                        priority
                    />
                </header>
                <div className={styles.container}>
                    <aside className={styles.progress}>
                        <AuthProgress aStep={step} handleClick={handleClick} />
                    </aside>
                    <div className={styles.content}>{renderStep()}</div>
                </div>
            </div>
        </RegisterProvider>
    )
}
