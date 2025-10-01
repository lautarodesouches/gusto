import { AuthStep } from '@/components'
import { API_URL } from '@/constants'
import { RegisterItem } from '@/types'

const getData = async () => {
    let data: RegisterItem[] = []

    try {
        const res = await fetch(`${API_URL}/CondicionMedica`)

        if (!res.ok) {
            throw new Error('Error en el fetch')
        }

        data = await res.json()
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
