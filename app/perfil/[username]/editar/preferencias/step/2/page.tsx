import { AuthStep } from '@/components'
import { API_URL } from '@/constants'
import { RegisterItem } from '@/types'
import { cookies } from 'next/headers'

const getData = async () => {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    let data: RegisterItem[] = []

    try {
        const res = await fetch(`${API_URL}/CondicionMedica`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        })

        if (!res.ok) {
            throw new Error('Error en el fetch')
        }

        const response = await res.json()
        // El backend devuelve objetos con campo Seleccionado
        data = response.map((item: { id: number; nombre: string; seleccionado?: boolean }) => ({
            id: item.id,
            nombre: item.nombre,
            seleccionado: item.seleccionado || false,
        }))
    } catch (error) {
        console.error('Error cargando los datos:', error)
        data = []
    }

    return data
}

export default async function StepThree() {
    const data = await getData()

    return (
        <AuthStep
            title="Condiciones médicas o dietas especiales"
            description="Información que afecta a las recomendaciones (ej: diabetes)"
            inputDescription="Escribe tus condiciones médicas o dietas"
            content={data}
        />
    )
}

