export type RegisterItem = {
    id: number
    nombre: string
}

export type Field = {
    value: string
    error: string
}

export type FormState = {
    email: Field
    password: Field
    repeat: Field
    name: Field
    lastname: Field
    username: Field
}

export type ResponseRegister = {
    success: boolean
    user?: {
        message: string
        usuario: {
            apellido: string
            email: string
            firebaseUid: string
            fotoPerfilUrl: string
            id: string
            nombre: string
        }
    }
    message?: string
}

export type Restaurant = {
    id: string
    propietarioUid: string
    horarios: unknown[]
    creadoUtc: string
    actualizadoUtc: string
    nombre: string
    direccion: string
    lat: number
    lng: number
    rating: number
    googlePlaceId: null
    tipo: string
    imagenUrl: string
    valoracion: null
    platos: unknown[]
    gustosQueSirve: unknown[]
    restriccionesQueRespeta: unknown[]
    score: number
}
