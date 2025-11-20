/**
 * Tipos relacionados con filtros de búsqueda
 */

export type Filter = {
    id: string
    name: string
    value: string
}

export type Filters = {
    dishes: Filter[]
    ratings: Filter[]
}

