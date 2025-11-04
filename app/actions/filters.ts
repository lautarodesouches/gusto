'use server'
import { API_URL } from '@/constants'
import { ApiResponse, Filters } from '@/types'
import { getAuthHeaders } from './common'

async function getDishes() {
    try {
        const res = await fetch(`${API_URL}/Gusto`, {
            method: 'GET',
            headers: {
                ...(await getAuthHeaders()),
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            return {
                success: false,
                error: errorData?.mensaje || 'Error al traer platos',
            }
        }

        interface Taste {
            id: string
            nombre: string
            imageUrl: string
            seleccionado: boolean
        }

        interface Response {
            pasoActual: string
            next: string
            gustos: Taste[]
        }

        const tastes: Response = await res.json()

        const modifyTastes = tastes.gustos.map(
            ({ id, nombre: name }: Taste) => ({
                id,
                name,
                value: name,
            })
        )

        return { success: true, data: modifyTastes }
    } catch (error) {
        console.error('Error getting dishes:', error)
        return {
            success: false,
            error: 'Error al traer platos',
        }
    }
}

const categories = [
    { id: '2', name: 'Americana', value: 'american_restaurant' },
    { id: '3', name: 'Asiática', value: 'asian_restaurant' },
    { id: '4', name: 'Panadería', value: 'bakery' },
    { id: '5', name: 'Barbacoa', value: 'barbecue_restaurant' },
    { id: '6', name: 'Brasileña', value: 'brazilian_restaurant' },
    { id: '7', name: 'Desayuno', value: 'breakfast_restaurant' },
    { id: '8', name: 'Brunch', value: 'brunch_restaurant' },
    { id: '9', name: 'Buffet', value: 'buffet_restaurant' },
    { id: '10', name: 'Cafetería', value: 'cafe' },
    { id: '11', name: 'China', value: 'chinese_restaurant' },
    { id: '12', name: 'Postres', value: 'dessert_restaurant' },
    { id: '13', name: 'Comedor', value: 'diner' },
    { id: '14', name: 'Comida rápida', value: 'fast_food_restaurant' },
    { id: '15', name: 'Gourmet', value: 'fine_dining_restaurant' },
    { id: '16', name: 'Francesa', value: 'french_restaurant' },
    { id: '17', name: 'Griega', value: 'greek_restaurant' },
    { id: '18', name: 'Hamburguesas', value: 'hamburger_restaurant' },
    { id: '19', name: 'India', value: 'indian_restaurant' },
    { id: '20', name: 'Italiana', value: 'italian_restaurant' },
    { id: '21', name: 'Japonesa', value: 'japanese_restaurant' },
    { id: '22', name: 'Coreana', value: 'korean_restaurant' },
    { id: '23', name: 'Libanesa', value: 'lebanese_restaurant' },
    {
        id: '24',
        name: 'Mediterránea',
        value: 'mediterranean_restaurant',
    },
    { id: '25', name: 'Mexicana', value: 'mexican_restaurant' },
    { id: '26', name: 'Pizzería', value: 'pizza_restaurant' },
    { id: '27', name: 'Mariscos', value: 'seafood_restaurant' },
    { id: '28', name: 'Sushi', value: 'sushi_restaurant' },
    { id: '29', name: 'Tailandesa', value: 'thai_restaurant' },
    { id: '30', name: 'Turca', value: 'turkish_restaurant' },
    { id: '31', name: 'Vegana', value: 'vegan_restaurant' },
    { id: '32', name: 'Vegetariana', value: 'vegetarian_restaurant' },
]

export async function getFilters(): Promise<ApiResponse<Filters>> {
    try {
        // Limit
        categories.length = 10

        const dishes = (await getDishes()).data || []

        // Limit
        dishes.length = 10

        const ratings = [
            { id: '1', name: '3.5', value: '3.5' },
            { id: '2', name: '4', value: '4' },
            { id: '3', name: '4.5', value: '4.5' },
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
