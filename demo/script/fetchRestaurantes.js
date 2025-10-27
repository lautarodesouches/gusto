// scripts/fetchRestaurantes.js
import fs from 'fs'
import fetch from 'node-fetch' // si usas Node 18+, puedes quitar esta línea
import path from 'path'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' }) // asegúrate que esté en la raíz del proyecto

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY // tu clave en .env.local o entorno
const LAT = -34.6438883 // coordenadas base (ej: Buenos Aires)
const LNG = -58.563229
const RADIUS = 5000 // radio en metros (5000 = 5 km)
const OUTPUT_PATH = path.resolve('./demo/data/restaurantes.json')

// Espera (necesario entre páginas de Google Places)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

async function fetchPage(url) {
    const res = await fetch(url)
    const data = await res.json()

    if (!data.results) {
        console.error('❌ Error al obtener datos:', data)
        return { results: [], next_page_token: null }
    }

    return {
        results: data.results,
        next_page_token: data.next_page_token,
    }
}

async function getAllRestaurants() {
    if (!API_KEY) {
        console.error('❌ Falta GOOGLE_MAPS_API_KEY en el entorno')
        process.exit(1)
    }

    let allResults = []
    let nextPageToken = null
    let page = 1

    // URL inicial
    let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${LAT},${LNG}&radius=${RADIUS}&type=restaurant&key=${API_KEY}`

    console.log(`🚀 Descargando restaurantes cercanos (${LAT},${LNG})...`)

    do {
        console.log(`📄 Página ${page}...`)
        const { results, next_page_token } = await fetchPage(url)

        allResults = allResults.concat(results)
        nextPageToken = next_page_token
        page++

        // Google requiere esperar 2 segundos antes de usar el next_page_token
        if (nextPageToken) {
            await delay(2000)
            url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${nextPageToken}&key=${API_KEY}`
        }
    } while (nextPageToken)

    console.log(`✅ ${allResults.length} restaurantes obtenidos.`)

    // Adaptar formato
    const restaurantes = allResults.map((place, i) => ({
        id: place.place_id || i,
        nombre: place.name,
        tipo: (place.types || []).join(', '),
        platos: [], // no viene en la API
        rating: place.rating || 0,
        lat: place.geometry?.location?.lat,
        lng: place.geometry?.location?.lng,
        direccion: place.vicinity || '',
    }))

    // Crear carpeta si no existe
    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })

    // Guardar JSON formateado
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(restaurantes, null, 2))

    console.log(`💾 Guardado en ${OUTPUT_PATH}`)
}

getAllRestaurants().catch(console.error)
