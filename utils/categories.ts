export function formatCategory(category: string): string {
    if (!category) return ''

    // Map of Google Places types to Spanish verbose names
    const categoryMap: Record<string, string> = {
        'restaurant': 'Restaurante',
        'bar': 'Bar',
        'cafe': 'Cafetería',
        'bakery': 'Panadería',
        'meal_takeaway': 'Comida para llevar',
        'meal_delivery': 'Servicio de comidas a domicilio',
        'food': 'Establecimiento de comida',
        'convenience_store': 'Tienda de conveniencia',
        'supermarket': 'Supermercado',
        'grocery_store': 'Tienda de comestibles',
        'liquor_store': 'Licorería',
        'wine_store': 'Tienda de vinos',
        'ice_cream_shop': 'Heladería',
        'dessert_shop': 'Postrería',
        'pizza_restaurant': 'Pizzería',
        'fast_food_restaurant': 'Restaurante de comida rápida',
        'seafood_restaurant': 'Restaurante de mariscos',
        'sushi_restaurant': 'Restaurante de sushi',
        'steak_house': 'Asador (Restaurante de carnes)',
        'burger_restaurant': 'Hamburguesería',
        'chinese_restaurant': 'Restaurante chino',
        'indian_restaurant': 'Restaurante indio',
        'italian_restaurant': 'Restaurante italiano',
        'mexican_restaurant': 'Restaurante mexicano',
        'korean_restaurant': 'Restaurante coreano',
        'japanese_restaurant': 'Restaurante japonés',
        'thai_restaurant': 'Restaurante tailandés',
        'vietnamese_restaurant': 'Restaurante vietnamita',
        'brewery': 'Cervecería artesanal',
        'night_club': 'Club nocturno',
        'lounge': 'Salón (Lounge/Bar)',
        'pub': 'Pub'
    };

    // Check if direct mapping exists
    if (categoryMap[category.toLowerCase()]) {
        return categoryMap[category.toLowerCase()]
    }

    // Fallback: Replace underscores with spaces and capitalize first letter
    return category
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
}
