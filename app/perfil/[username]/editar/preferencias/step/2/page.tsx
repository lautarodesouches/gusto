import { AuthStep } from '@/components'
import { getCondicionesMedicas } from '@/app/actions/steps'

export default async function StepThree() {
    const result = await getCondicionesMedicas()
    const data = result.success && result.data ? result.data : []

    return (
        <AuthStep
            title="Condiciones médicas o dietas especiales"
            description="Información que afecta a las recomendaciones (ej: diabetes)"
            inputDescription="Escribe tus condiciones médicas o dietas"
            content={data}
        />
    )
}

