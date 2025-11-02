'use server'
import { ApiResponse, Filters } from '@/types'

export async function getFilters(): Promise<
    ApiResponse<Filters>
> {
    try {
        const categories = [
            { id: 1, name: 'Italiana' },
            { id: 2, name: 'Japonesa' },
            { id: 3, name: 'Parrilla' },
            { id: 4, name: 'Mexicana' },
            { id: 5, name: 'China' },
            { id: 6, name: 'Vegana' },
            { id: 7, name: 'Vegetariana' },
            { id: 8, name: 'Rápida' },
            { id: 9, name: 'Mediterránea' },
        ]

        const dishes = [
            { id: 1, name: 'Pizza' },
            { id: 2, name: 'Sushi' },
            { id: 3, name: 'Hamburguesas' },
            { id: 4, name: 'Pasta' },
            { id: 5, name: 'Ensaladas' },
            { id: 6, name: 'Postres' },
        ]

        const ratings = [
            { id: 1, name: '4' },
            { id: 2, name: '4.5' },
            { id: 3, name: '5' },
        ]

        const data = {
            dishes,
            categories,
            ratings,
        }

        return { success: true, data }
    } catch (error) {
        console.error('Error getting friend:', error)
        return {
            success: false,
            error: 'Error al obtener amigos',
        }
    }
}
