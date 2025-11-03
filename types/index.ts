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

export interface Restaurant {
    
    id: string
    propietarioUid: string
    horarios: Record<string, unknown> // como viene vacío o puede ser JSON dinámico
    creadoUtc: string // ISO date string
    actualizadoUtc: string // ISO date string
    nombre: string
    direccion: string
    latitud: number
    longitud: number
    rating: number
    googlePlaceId: string | null
    tipo: string // si luego querés, podés hacer enum
    imagenUrl: string
    valoracion: number | null
    platos: string[]
    gustosQueSirve: Gusto[]
    restriccionesQueRespeta: Restriccion[]
    score: number
    reviews: Review[]
}

export interface Review {
  id: string
  autor: string
  rating: number
  texto: string
  fecha: string
  foto?: string
  restauranteId?: string

  // campos opcionales antiguos (para compatibilidad)
  userId?: string
  userName?: string
  userAvatar?: string
  title?: string
  content?: string
  images?: string[]
  isVerified?: boolean
}

export interface Gusto {
    id: string
    nombre: string
}

export interface Restriccion {
    id: string
    nombre: string
}

export type Friend = {
    id: string
    nombre: string
    email: string
    username: string
    fotoPerfilUrl: string
}

export type FriendInvitation = {
    id: string
    remitente: Friend
    destinatario: Friend
    estado: 'Pendiente'
    fechaEnvio: string
    fechaRespuesta: null
    mensaje: null
}

export type Group = {
    activo: boolean
    administradorFirebaseUid: string
    administradorId: string
    administradorNombre: string
    cantidadMiembros: number
    codigoInvitacion: string
    descripcion: string
    fechaCreacion: string
    fechaExpiracionCodigo: string
    id: string
    miembros: GroupMember[]
    nombre: string
}

export type GroupMember = {
    usuarioUsername: string;
    usuarioEmail: string;
    usuarioNombre: string;
    id: string;
}

export type User = {
    nombre: string
    apellido: string
    username: string
    fotoPerfilUrl: string
    esPrivado: boolean
    gustos: {
        id: string
        nombre: string
    }[]
    visitados: {
        id: number
        nombre: string
        lat: number
        lng: number
    }[]
}

export type ApiResponse<T> = {
    success: boolean
    data?: T
    error?: string
}



export interface SocialData {
    friends: Friend[]
    friendsRequests: Friend[]
    groups: Group[]
    groupsRequests: Group[]
}

export interface Filters {
    dishes: { id: number; name: string }[]
    categories: { id: number; name: string }[]
    ratings: { id: number; name: string }[]
}

export interface Coordinates {
    lat: number
    lng: number
}