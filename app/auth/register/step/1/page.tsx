import { AuthStep } from '@/components'
import { getRestricciones } from '@/app/actions/steps'
import { PreventWrapper } from '../../PreventWrapper'

export default async function Step() {
    const result = await getRestricciones()
    const data = result.success && result.data ? result.data : []

    return (
        <>
            <PreventWrapper />
            <AuthStep
                title="Alguna alergia o intolerancia?"
                description="Selecciona las que corresponden; son preferencias críticas"
                inputDescription="Escribe tus alergias o intolerancias"
                content={data}
            />
        </>
    )
}
