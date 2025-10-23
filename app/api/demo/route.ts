import { NextResponse } from 'next/server'
import restaurantes from '@/demo/data/restaurantes.json'

// Calcula distancia entre coordenadas (en km)
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371 // Radio terrestre en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)

    const nearLat = parseFloat(searchParams.get('near.lat') || '')
    const nearLng = parseFloat(searchParams.get('near.lng') || '')

    // Convertir strings separados por coma en arrays
    const tipoParams = (searchParams.get('tipo') || '')
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean)

    const platoParams = (searchParams.get('plato') || '')
        .split(',')
        .map(p => p.trim().toLowerCase())
        .filter(Boolean)

    const rating = parseFloat(searchParams.get('rating') || '0')
    const radius = parseFloat(searchParams.get('radius') || '100') // default 100 km

    let results = restaurantes

    // Filtro por tipo de restaurante (si hay varios, cualquiera que coincida)
    if (tipoParams.length > 0) {
        results = results.filter(r =>
            r.tipo.some((t: string) => tipoParams.includes(t.toLowerCase()))
        )
    }

    // Filtro por plato (si hay varios, cualquiera que coincida)
    if (platoParams.length > 0) {
        results = results.filter(r =>
            r.platos.some((p: string) => platoParams.includes(p.toLowerCase()))
        )
    }

    // Filtro por rating mínimo
    if (!isNaN(rating) && rating > 0) {
        results = results.filter(r => r.rating >= rating)
    }

    // Filtro por cercanía
    if (!isNaN(nearLat) && !isNaN(nearLng)) {
        results = results
            .map(r => ({
                ...r,
                distance: distanceKm(nearLat, nearLng, r.lat, r.lng),
            }))
            .filter(r => r.distance <= radius)
            .sort((a, b) => a.distance - b.distance)
    }

    return NextResponse.json(results)
}
