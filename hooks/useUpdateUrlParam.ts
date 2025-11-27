import { useRouter, useSearchParams } from 'next/navigation'

export function useUpdateUrlParam() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const updateUrlParam = (key: string, value: string | string[] | null) => {
        const params = new URLSearchParams(searchParams.toString())

        // Primero eliminamos la clave existente para evitar duplicados o mezclas
        params.delete(key)

        if (value) {
            if (Array.isArray(value)) {
                params.set(key, value.join(' '))
            } else {
                params.set(key, value)
            }
        } else {
            params.delete(key)
        }

        router.replace(`?${params.toString()}`, { scroll: false })
    }

    return updateUrlParam
}
