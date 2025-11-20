import { AuthStep } from '@/components'
import { getGustos } from '@/app/actions/steps'

export default async function Step() {
    const result = await getGustos()
    const data = result.success && result.data ? result.data : []

    return (
        <AuthStep
            title="Que te gusta comer?"
            description="Seleccioná al menos 3 y hasta 5 tipos de cocina o platos que prefieras (mínimo 3 requeridos)"
            inputDescription="Escribe una comida"
            content={data}
        />
    )
}

