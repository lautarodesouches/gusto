import { AuthStep } from '@/components'
import { getGustos } from '@/app/actions/steps'
import { PreventWrapper } from '../../PreventWrapper'

export default async function Step() {
    const result = await getGustos()
    const data = result.success && result.data ? result.data : []

    return (
        <>
            <PreventWrapper />
            <AuthStep
                title="Que te gusta comer?"
                description="Seleccioná al menos 3 tipos de cocina o platos que prefieras (mínimo 3 requeridos)"
                inputDescription="Escribe una comida"
                content={data}
            />
        </>
    )
}
