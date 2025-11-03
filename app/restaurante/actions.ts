'use server'
import { API_URL } from '@/constants'
import { ApiResponse, Restaurant, Review } from '@/types'
import { cookies } from 'next/headers'

async function getAuthHeaders(): Promise<HeadersInit> {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    }
}

export async function getRestaurant(
    id: string
): Promise<ApiResponse<Restaurant>> {
    try {
        const res = await fetch(`${API_URL}/api/Restaurantes/${id}`, {
            headers: await getAuthHeaders(),
            cache: 'no-store',
        })

        if (!res.ok) {
            return {
                success: false,
                error: 'Restaurante no encontrado',
            }
        }

        const restaurant = await res.json()
        return { success: true, data: restaurant }
    } catch (error) {
        console.error('Error getting restaurant:', error)
        return {
            success: false,
            error: 'Error al cargar el restaurante',
        }
    }
}

export async function getReviewsByRestaurantId(id: string): Promise<ApiResponse<Review[]>> {
    try {
        const mockReviews: Review[] = [
            {
                id: '1',
                userId: 'user1',
                userName: 'María González',
                rating: 5,
                title: 'Maravillosa y recomendable',
                content:
                    'Excelente servicio en todos los puntos, desde la recepción servicio y despedida, cada paso de los platos la participación y lo servicial es una experiencia agradable, el chef un genio y las ayudantes también unas genias',
                images: [
                    'https://picsum.photos/200/200?random=1',
                    'https://picsum.photos/200/200?random=2',
                    'https://picsum.photos/200/200?random=3',
                    'https://picsum.photos/200/200?random=4',
                ],
                date: '2025-08-06',
                isVerified: true,
            },
            {
                id: '2',
                userId: 'user2',
                userName: 'Carlos Rodríguez',
                rating: 5,
                title: 'Experiencia inolvidable',
                content:
                    'Desde que entramos nos sentimos como en casa. La atención al detalle es impresionante, cada plato es una obra de arte. El personal super amable y atento. Definitivamente volveremos!',
                date: '2025-07-28',
                isVerified: true,
            },
            {
                id: '3',
                userId: 'user3',
                userName: 'Ana Martínez',
                userAvatar: 'https://i.pravatar.cc/150?img=5',
                rating: 4,
                title: 'Muy buena experiencia',
                content:
                    'Comida deliciosa y ambiente agradable. Los platos tienen una presentación exquisita. Solo le pondría una pequeña pega al tiempo de espera entre platos, pero nada que arruine la experiencia.',
                images: [
                    'https://picsum.photos/200/200?random=5',
                    'https://picsum.photos/200/200?random=6',
                ],
                date: '2025-07-15',
                isVerified: true,
            },
            {
                id: '4',
                userId: 'user4',
                userName: 'Jorge López',
                rating: 5,
                title: 'Perfecto para ocasiones especiales',
                content:
                    'Celebramos nuestro aniversario aquí y fue perfecto. El menú degustación es espectacular, cada plato mejor que el anterior. El maridaje de vinos estuvo excelente. Precios acordes a la calidad.',
                date: '2025-07-10',
                isVerified: true,
            },
            {
                id: '5',
                userId: 'user5',
                userName: 'Laura Fernández',
                userAvatar: 'https://i.pravatar.cc/150?img=9',
                rating: 5,
                title: 'Simplemente espectacular',
                content:
                    'No tengo palabras para describir lo increíble que fue esta experiencia gastronómica. Cada detalle cuidado al máximo. El chef salió a saludar y explicar los platos. Totalmente recomendable.',
                images: ['https://picsum.photos/200/200?random=7'],
                date: '2025-06-25',
                isVerified: true,
            },
        ]

        return { success: true, data: mockReviews }
    } catch (error) {
        console.error('Error getting restaurant:', error)
        return {
            success: false,
            error: 'Error al cargar el restaurante',
        }
    }
}
