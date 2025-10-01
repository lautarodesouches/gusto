import { AuthStep } from '@/components'
import { API_URL } from '@/constants'
import { RegisterItem } from '@/types'

const getData = async () => {
    let data: RegisterItem[] = []

    try {
        const res = await fetch(`${API_URL}/Gusto`)

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

export default async function Step() {
    const content = await getData()

    return (
        <AuthStep
            title="¿Que te gusta comer?"
            description="Seleccioná hasta 5 tipos de cocina o platos que
                prefieras (podés agregar otros)"
            inputDescription="Escribe una comida"
            content={content}
        />
    )
}
