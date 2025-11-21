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

export function formatChatDate(dateString: string): { date: string; time: string } {
    const date = new Date(dateString)
    const now = new Date()

    const argDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }))
    const argNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }))

    const diffTime = argNow.getTime() - argDate.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)

    const sameDay =
        argDate.getDate() === argNow.getDate() &&
        argDate.getMonth() === argNow.getMonth() &&
        argDate.getFullYear() === argNow.getFullYear()

    const yesterday =
        argDate.getDate() === argNow.getDate() - 1 &&
        argDate.getMonth() === argNow.getMonth() &&
        argDate.getFullYear() === argNow.getFullYear()

    const time = new Intl.DateTimeFormat('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/Argentina/Buenos_Aires',
    }).format(date)

    if (sameDay) {
        return { date: 'Hoy', time }
    }

    if (yesterday) {
        return { date: 'Ayer', time }
    }

    if (diffDays < 7) {
        const weekday = new Intl.DateTimeFormat('es-AR', { 
            weekday: 'long',
            timeZone: 'America/Argentina/Buenos_Aires',
        }).format(date)
        return { 
            date: weekday.charAt(0).toUpperCase() + weekday.slice(1), 
            time 
        }
    }

    if (argDate.getFullYear() === argNow.getFullYear()) {
        // Ej: "3 nov."
        return { 
            date: new Intl.DateTimeFormat('es-AR', {
                day: 'numeric',
                month: 'short',
                timeZone: 'America/Argentina/Buenos_Aires',
            }).format(date),
            time
        }
    }

    // Ej: "3 nov. 2024"
    return { 
        date: new Intl.DateTimeFormat('es-AR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            timeZone: 'America/Argentina/Buenos_Aires',
        }).format(date),
        time
    }
}

export function pasoToNumber(paso: string) {
    switch (paso) {
        case "Restricciones": return 1
        case "Condiciones": return 2
        case "Gustos": return 3
        default: return 1
    }
}
