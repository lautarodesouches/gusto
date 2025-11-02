export function formatPhoneAR(phone: string): string {
    // Eliminar todo lo que no sea número
    const digits = phone.replace(/\D/g, '')

    // Detectar si es celular con 9
    const isMobile = digits.startsWith('9', 2)

    // Si tiene código de país
    if (digits.startsWith('54')) {
        const area = digits.slice(isMobile ? 3 : 2, isMobile ? 5 : 4)
        const number = digits.slice(isMobile ? 5 : 4)
        return `+54 ${isMobile ? '9 ' : ''}${area} ${number.slice(
            0,
            4
        )}-${number.slice(4)}`
    }

    // Si no tiene código de país (ej: 1123456789)
    if (digits.length === 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(
            6
        )}`
    }

    // Fallback si no se reconoce
    return phone
}