import { AuthStep } from '@/components'

import { API_URL } from '@/constants'
import { RegisterItem } from '@/types'
import { cookies } from 'next/headers'
import { PreventWrapper } from '../../PreventWrapper'

const getData = async () => {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    let data: RegisterItem[] = []

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

        const response = await res.json()
        // El backend devuelve objetos con campo Seleccionado
        data = response.map((item: { id: number; nombre: string; seleccionado?: boolean }) => ({
            id: item.id,
            nombre: item.nombre,
            seleccionado: item.seleccionado || false,
        }))
    } catch (error) {
        console.error('Error cargando los datos:', error)
        data = []
    }

    return data
}

export default async function Step() {
    const data = await getData()

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
