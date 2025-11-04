// components/Toast/ToastContainer.tsx
'use client'

import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useCallback,
} from 'react'
import styles from '../components/Toast/styles.module.css'
import Toast, { ToastType } from '@/components/Toast'

interface ToastData {
    id: string
    type: ToastType
    message: string
}

interface ToastContextType {
    addToast: (type: ToastType, message: string) => void
    success: (message: string) => void
    error: (message: string) => void
    info: (message: string) => void
    warning: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastData[]>([])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }, [])

    const addToast = useCallback((type: ToastType, message: string) => {
        const id = Math.random().toString(36).substring(7)
        setToasts(prev => [...prev, { id, type, message }])
    }, [])

    const success = useCallback(
        (message: string) => addToast('success', message),
        [addToast]
    )
    const error = useCallback(
        (message: string) => addToast('error', message),
        [addToast]
    )
    const info = useCallback(
        (message: string) => addToast('info', message),
        [addToast]
    )
    const warning = useCallback(
        (message: string) => addToast('warning', message),
        [addToast]
    )

    return (
        <ToastContext.Provider
            value={{ addToast, success, error, info, warning }}
        >
            {children}
            <div className={styles.toastContainer}>
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        id={toast.id}
                        type={toast.type}
                        message={toast.message}
                        onClose={removeToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within ToastProvider')
    }
    return context
}
