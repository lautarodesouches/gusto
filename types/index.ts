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
    id: number
    nombre: string
    direccion: string
    latitud: number
    longitud: number
    horarios: string
    tipo: string
    platos: string[]
    imagenUrl: string
    valoracion: number
}
