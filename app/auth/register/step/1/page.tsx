import { AuthStep } from '@/components'
import { API_URL } from '@/constants'
import { RegisterItem } from '@/types'
import { cookies } from 'next/headers'

const getData = async () => {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    let data: { restricciones: RegisterItem[] } = { restricciones: [] }

    try {
        const res = await fetch(`${API_URL}/Restriccion`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        })

        if (!res.ok) {
            throw new Error('Error en el fetch')
        }

        data = await res.json()
    } catch (error) {
        console.error('Error cargando los datos:', error)
        data.restricciones = []
    }

    return data.restricciones
}

export default async function Step() {
    const data = await getData()

    if (!data || data.length === 0) {
        return (
            <div
                style={{
                    color: 'var(--white)',
                    textAlign: 'center',
                    padding: '2rem',
                }}
            >
                No se pudieron cargar las opciones. Intenta recargar la
                página.
            </div>
        )
    }

    return (
        <AuthStep
            title="Alguna alergia o intolerancia?"
            description="Selecciona las que corresponden; son preferencias críticas"
            inputDescription="Escribe tus alergias o intolerancias"
            content={data}
        />
    )
}
