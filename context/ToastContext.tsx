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
    duration?: number
}

interface ToastContextType {
    addToast: (type: ToastType, message: string, duration?: number) => void
    success: (message: string, duration?: number) => void
    error: (message: string, duration?: number) => void
    info: (message: string, duration?: number) => void
    warning: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastData[]>([])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }, [])

    const addToast = useCallback((type: ToastType, message: string, duration?: number) => {
        const id = Math.random().toString(36).substring(7)
        setToasts(prev => [...prev, { id, type, message, duration }])
    }, [])

    const success = useCallback(
        (message: string, duration?: number) => addToast('success', message, duration),
        [addToast]
    )
    const error = useCallback(
        (message: string, duration?: number) => addToast('error', message, duration),
        [addToast]
    )
    const info = useCallback(
        (message: string, duration?: number) => addToast('info', message, duration),
        [addToast]
    )
    const warning = useCallback(
        (message: string, duration?: number) => addToast('warning', message, duration),
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
                        duration={toast.duration}
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
