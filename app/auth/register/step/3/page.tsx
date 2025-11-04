import { AuthStep } from '@/components'
import { API_URL } from '@/constants'
import { RegisterItem } from '@/types'
import { cookies } from 'next/headers'

const getData = async () => {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    let data: RegisterItem[] = []

    try {
        const res = await fetch(`${API_URL}/Gusto`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        })

        if (!res.ok) {
            throw new Error('Error en el fetch')
        }

        const temp = await res.json()

        data = temp.gustos
    } catch (error) {
        console.error('Error cargando los datos:', error)
        data = []
    }

    return data
}

export default async function Step() {
    const data = await getData()

    return (
        <AuthStep
            title="Que te gusta comer?"
            description="Seleccioná al menos 3 y hasta 5 tipos de cocina o platos que prefieras (mínimo 3 requeridos)"
            inputDescription="Escribe una comida"
            content={data}
        />
    )
}
