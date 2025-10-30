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

    if (!data || data.length === 0) {
        return (
            <div
                style={{
                    color: 'var(--white)',
                    textAlign: 'center',
                    padding: '2rem',
                }}
            >
                No se pudieron cargar las opciones. Intenta recargar la página.
            </div>
        )
    }

    return (
        <AuthStep
            title="Que te gusta comer?"
            description="Seleccioná hasta 5 tipos de cocina o platos que
                prefieras (podés agregar otros)"
            inputDescription="Escribe una comida"
            content={data}
        />
    )
}
