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

export function formatChatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()

    const diffTime = now.getTime() - date.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)

    const sameDay =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()

    const yesterday =
        date.getDate() === now.getDate() - 1 &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()

    if (sameDay) {
        // Ej: "10:09 p. m."
        return new Intl.DateTimeFormat('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }).format(date)
    }

    if (yesterday) return 'ayer'

    if (diffDays < 7) {
        // Ej: "domingo"
        return new Intl.DateTimeFormat('es-AR', { weekday: 'long' }).format(
            date
        )
    }

    if (date.getFullYear() === now.getFullYear()) {
        // Ej: "3 nov."
        return new Intl.DateTimeFormat('es-AR', {
            day: 'numeric',
            month: 'short',
        }).format(date)
    }

    // Ej: "3 nov. 2024"
    return new Intl.DateTimeFormat('es-AR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date)



}

export function pasoToNumber(paso: string) {
    switch (paso) {
        case "Restricciones": return 1
        case "Condiciones": return 2
        case "Gustos": return 3
        default: return 1
    }
}
