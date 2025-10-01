'use client'
import { RegisterItem } from '@/types'
import { createContext, useContext, useState, ReactNode } from 'react'

interface RegisterData {
    step1?: RegisterItem[]
    step2?: RegisterItem[]
    step3?: RegisterItem[]
}

interface RegisterContextType {
    data: RegisterData
    setData: (newData: Partial<RegisterData>) => void
}

const RegisterContext = createContext<RegisterContextType | undefined>(
    undefined
)

export function RegisterProvider({ children }: { children: ReactNode }) {
    const [data, setDataState] = useState<RegisterData>({})

    const setData = (newData: Partial<RegisterData>) => {
        setDataState(prev => ({ ...prev, ...newData }))
    }

    return (
        <RegisterContext.Provider value={{ data, setData }}>
            {children}
        </RegisterContext.Provider>
    )
}

export function useRegister() {
    const ctx = useContext(RegisterContext)
    if (!ctx)
        throw new Error('useRegister debe usarse dentro de RegisterProvider')
    return ctx
}
