import { NextResponse } from 'next/server'

// Coordenadas base (Ramos Mejía)
const BASE_LAT = -34.6482
const BASE_LNG = -58.5623

// Función auxiliar para generar un número aleatorio dentro de un rango
const randomOffset = (min: number, max: number) =>
    Math.random() * (max - min) + min

// Datos simulados
const restaurantTypes = [
    'Parrilla',
    'Pizzería',
    'Café',
    'Restaurante italiano',
    'Restaurante japonés',
    'Hamburguesería',
    'Heladería',
    'Comida mexicana',
]

const sampleDishes: Record<string, string[]> = {
    Parrilla: ['Asado', 'Choripán', 'Provoleta'],
    Pizzería: ['Pizza muzzarella', 'Fugazzeta', 'Calzone'],
    Café: ['Café con leche', 'Medialunas', 'Tostado'],
    'Restaurante italiano': ['Pasta', 'Lasagna', 'Risotto'],
    'Restaurante japonés': ['Sushi', 'Ramen', 'Tempura'],
    Hamburguesería: ['Hamburguesa clásica', 'Cheeseburger', 'Papas fritas'],
    Heladería: ['Dulce de leche', 'Chocolate', 'Frutilla'],
    'Comida mexicana': ['Tacos', 'Burritos', 'Nachos'],
}

export async function GET() {
    const restaurants = Array.from({ length: 30 }).map((_, i) => {
        const tipo =
            restaurantTypes[Math.floor(Math.random() * restaurantTypes.length)]

        return {
            nombre: `${tipo} ${i + 1}`,
            direccion: `Calle Falsa ${100 + i}, Ramos Mejía`,
            latitud: BASE_LAT + randomOffset(-0.005, 0.005),
            longitud: BASE_LNG + randomOffset(-0.005, 0.005),
            horarios: 'Lunes a Domingo: 10:00 - 23:00',
            tipo,
            platos: sampleDishes[tipo] || ['Comida variada'],
            imagenUrl: `https://source.unsplash.com/400x300/?${encodeURIComponent(
                tipo
            )}`,
            valoracion: parseFloat(
                (Math.random() * (5 - 3.5) + 3.5).toFixed(1)
            ),
        }
    })

    return NextResponse.json(restaurants)
}
