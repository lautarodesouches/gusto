'use client'
import { RegisterItem } from '@/types'
import { createContext, useContext, useState, ReactNode } from 'react'

export type RegisterMode = 'registro' | 'edicion'

interface RegisterData {
    step1?: RegisterItem[]
    step2?: RegisterItem[]
    step3?: RegisterItem[]
}

interface RegisterContextType {
    data: RegisterData
    setData: (newData: Partial<RegisterData>) => void
    mode: RegisterMode
    setMode: (mode: RegisterMode) => void
    basePath: string
    setBasePath: (path: string) => void
}

const RegisterContext = createContext<RegisterContextType | undefined>(
    undefined
)

interface RegisterProviderProps {
    children: ReactNode
    mode?: RegisterMode
    basePath?: string
}

export function RegisterProvider({ 
    children, 
    mode: initialMode = 'registro',
    basePath: initialBasePath = '/auth/register/step'
}: RegisterProviderProps) {
    const [data, setDataState] = useState<RegisterData>({})
    const [mode, setMode] = useState<RegisterMode>(initialMode)
    const [basePath, setBasePath] = useState<string>(initialBasePath)

    const setData = (newData: Partial<RegisterData>) => {
        setDataState(prev => ({ ...prev, ...newData }))
    }

    return (
        <RegisterContext.Provider value={{ 
            data, 
            setData, 
            mode, 
            setMode,
            basePath,
            setBasePath
        }}>
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
