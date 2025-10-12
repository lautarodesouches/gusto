import { useRouter, useSearchParams } from 'next/navigation'

export function useUpdateUrlParam() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const updateUrlParam = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString())

        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }

        router.replace(`?${params.toString()}`, { scroll: false })
    }

    return updateUrlParam
}
