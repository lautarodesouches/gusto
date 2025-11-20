import { AuthStep } from '@/components'
import { getRestricciones } from '@/app/actions/steps'

export default async function Step() {
    const result = await getRestricciones()
    const data = result.success && result.data ? result.data : []

    return (
        <AuthStep
            title="Alguna alergia o intolerancia?"
            description="Selecciona las que corresponden; son preferencias críticas"
            inputDescription="Escribe tus alergias o intolerancias"
            content={data}
        />
    )
}

