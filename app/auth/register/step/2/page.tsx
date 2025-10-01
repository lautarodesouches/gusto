import { AuthStep } from '@/components'
import { API_URL } from '@/constants'
import { RegisterItem } from '@/types'

const getData = async () => {
    let data: RegisterItem[] = []

    try {
        const res = await fetch(`${API_URL}/Restriccion`)

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
    const data = await getData()

    return (
        <AuthStep
            title="¿Alguna alergia o intolerancia?"
            description="Selecciona las que corresponden; son preferencias críticas"
            inputDescription="Escribe tus alergias o intolerancias"
            content={data}
        />
    )
}
