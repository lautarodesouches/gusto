'use client'
import { useRegistrationCheck } from '@/hooks/useRegistrationCheck'

export default function RegistrationCheck() {
    // El hook tiene protección interna: solo se ejecuta en rutas no públicas
    useRegistrationCheck()
    return null
}

