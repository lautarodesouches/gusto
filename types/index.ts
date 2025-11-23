export type RegisterItem = {
    id: string
    nombre: string
    seleccionado?: boolean
    imagenUrl?: string
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
    propietarioUid?: string
    horarios?: Record<string, unknown> // como viene vacío o puede ser JSON dinámico
    horariosJson?: string
    creadoUtc?: string // ISO date string
    actualizadoUtc?: string // ISO date string
    nombre: string
    direccion: string
    latitud: number
    longitud: number
    rating?: number
    valoracion?: number | null
    googlePlaceId?: string | null
    placeId?: string | null
    tipo?: string // si luego querés, podés hacer enum
    categoria?: string
    primaryType?: string
    imagenUrl?: string
    platos?: string[]
    gustosQueSirve?: Gusto[]
    restriccionesQueRespeta?: Restriccion[]
    score?: number
    reviews?: Review[]
    // Nuevos campos del RestauranteDetalleDto
    esDeLaApp: boolean
    webUrl?: string | null
    cantidadResenas?: number | null
    // Imágenes
    logoUrl?: string | null
    imagenDestacada?: string | null
    imagenesInterior: string[]
    imagenesComida: string[]
    // Menú OCR
    menu?: RestauranteMenu | null
    // Reviews separadas
    reviewsLocales: Review[]
    reviewsGoogle: Review[]
}

export interface Review {
    id: string
    autor: string
    rating: number
    texto: string
    fecha: string
    foto?: string
    restauranteId?: string

    userId?: string
    userName?: string
    userAvatar?: string
    title?: string
    content?: string
    images?: string[]
    isVerified?: boolean
    
    esImportada?: boolean
    fuenteExterna?: string
    fechaVisita?: string
    motivoVisita?: string
    mesAnioVisita?: string
    
    autorExterno?: string
    imagenAutorExterno?: string
    valoracion?: number
    opinion?: string
    fechaCreacion?: string
    titulo?: string
    usuarioId?: string
    usuario?: {
        nombre?: string
        username?: string
        fotoPerfilUrl?: string
    }
     fotos?: Array<
        | {
              url?: string
              id?: string
          }
        | string
    >
}

export interface Gusto {
    id: string
    nombre: string
}

export interface Restriccion {
    id: string
    nombre: string
}

// Tipos para el menú OCR
export interface RestauranteMenu {
    nombreMenu: string
    moneda: string
    categorias: CategoriaMenu[]
}

export interface CategoriaMenu {
    nombre: string
    items: ItemMenu[]
}

export interface ItemMenu {
    nombre: string
    descripcion?: string | null
    precios: PrecioMenu[]
}

export interface PrecioMenu {
    tamaño: string
    monto: number
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
    id: string
    usuarioId: string
    usuarioFirebaseUid: string
    usuarioNombre: string
    usuarioEmail: string
    usuarioUsername: string
    fechaUnion: string
    esAdministrador: boolean
    fotoPerfilUrl?: string
}

export type User = {
    nombre: string
    apellido: string
    username: string
    fotoPerfilUrl: string
    esPrivado: boolean
    plan: 'Free' | 'Plus'
    esPremium: boolean
    esMiPerfil : boolean
    esAmigo : boolean
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

// Tipos para funcionalidad Premium y Pagos
export type PlanUsuario = 'Free' | 'Plus'

export interface BeneficiosPremium {
    beneficios: string[]
    precio: number
    moneda: string
}

export interface LimiteGruposResponse {
    mensaje: string
    tipoPlan: string
    limiteActual: number
    gruposActuales: number
    beneficiosPremium: BeneficiosPremium
    urlPago: string
}

export interface CrearPagoRequest {
    email: string
    nombreCompleto: string
}

export interface CrearPagoResponse {
    id: string
    initPoint: string
    sandboxInitPoint: string
    status: string
}

export interface PagoError {
    message: string
    details?: string
}

export interface Filter {
    id: string
    name: string
    value: string
}

export interface Filters {
    dishes: Filter[]
    ratings: Filter[]
}

export interface Coordinates {
    lat: number
    lng: number
}
export interface UsuarioSimpleResponse {
    id: string
    nombre: string
    username: string
    email: string
    fotoPerfilUrl: string
}

export interface SolicitudAmistadResponse {
    id: string
    remitente: UsuarioSimpleResponse
    destinatario: UsuarioSimpleResponse
    estado: string
    fechaEnvio: string
    fechaRespuesta?: string
    mensaje?: string
}

export interface SolicitudRestaurante {
    id: string
    nombreRestaurante: string
    direccion: string
    usuarioNombre: string
    usuarioEmail: string
    imgLogo?: string
    fechaCreacionUtc: string
    status?: SolicitudStatus
}

export type SolicitudStatus = 'Todos' | 'Pendiente' | 'Aceptado' | 'Rechazado'

// Tipos para respuestas del backend (PascalCase)
export interface SolicitudRestauranteBackend {
    Id?: string
  
    NombreRestaurante?: string
  
    Direccion?: string
   
    UsuarioNombre?: string
  
    UsuarioEmail?: string
    
    imgLogo?: string
    FechaCreacionUtc?: string
   
    Estado?: number | string
    
    EstadoSolicitudRestaurante?: number | string
    
}

export interface ItemSimpleBackend {
    Id?: string | number
    Nombre?: string
   
}

export interface DatosSolicitudRestauranteBackend {
    Gustos?: ItemSimpleBackend[]
   
    Restricciones?: ItemSimpleBackend[]
   
}

export interface HorarioSimpleDto {
    Dia: string
   
    Cerrado: boolean

    Desde?: string | null
 
    Hasta?: string | null
   
}

export interface SolicitudRestauranteDetalleBackend {
    Id?: string
   
    UsuarioId?: string
  
    UsuarioNombre?: string

    UsuarioEmail?: string
  
    NombreRestaurante?: string
  
    Direccion?: string

    Latitud?: number | null

    Longitud?: number | null

    PrimaryType?: string

    Types?: string[]

    HorariosJson?: string | null

     Gustos?: ItemSimpleBackend[]
   
    Restricciones?: ItemSimpleBackend[]
    
    ImagenesDestacadas?: string
    
    ImagenesInterior?: string[]
   
    ImagenesComida?: string[]
 
    ImagenMenu?: string | null
 
    Logo?: string | null

    FechaCreacionUtc?: string
 
    Horarios?: HorarioSimpleDto[]
    
    WebsiteUrl?: string | null
}

export interface SolicitudRestauranteDetalle {
    id: string
    usuarioId: string
    usuarioNombre: string
    usuarioEmail: string
    nombreRestaurante: string
    direccion: string
    latitud?: number | null
    longitud?: number | null
    primaryType: string
    types: string[]
    horariosJson?: string | null
    gustos: Array<{ id: string; nombre: string }>
    restricciones: Array<{ id: string; nombre: string }>
    imagenesDestacadas: string
    imagenesInterior: string[]
    imagenesComida: string[]
    imagenMenu?: string | null
    logo?: string | null
    fechaCreacionUtc: string
    horarios: Array<{
        dia: string
        cerrado: boolean
        desde?: string | null
        hasta?: string | null
    }>
    websiteUrl?: string | null
}
export type EstadoVotacion = 'Activa' | 'Cerrada' | 'Cancelada'

export interface Votacion {
    id: string
    grupoId: string
    estado: EstadoVotacion
    fechaInicio: string
    fechaCierre?: string
    restauranteGanadorId?: string
    descripcion?: string
}

export interface Voto {
    id: string
    votacionId: string
    usuarioId: string
    restauranteId: string
    fechaVoto: string
    comentario?: string
}

export interface VotanteInfo {
    usuarioId: string
    usuarioNombre: string
    usuarioFoto: string
    comentario?: string
}

export interface RestauranteVotado {
    restauranteId: string
    restauranteNombre: string
    restauranteDireccion: string
    restauranteImagenUrl: string
    cantidadVotos: number
    votantes: VotanteInfo[]
}

export interface ResultadoVotacion {
    votacionId: string
    grupoId: string
    estado: EstadoVotacion
    todosVotaron: boolean
    miembrosActivos: number
    totalVotos: number
    restaurantesVotados: RestauranteVotado[]
    ganadorId?: string
    hayEmpate: boolean
    restaurantesEmpatados: string[]
    fechaInicio: string
    fechaCierre?: string
}

export interface IniciarVotacionRequest {
    grupoId: string
    descripcion?: string
}

export interface RegistrarVotoRequest {
    restauranteId: string
    comentario?: string
}

export interface RestauranteMetricasDashboard {
    restauranteId: string
    totalTop3Individual: number
    totalTop3Grupo: number
    totalVisitasPerfil: number
    totalFavoritosHistorico: number
    totalFavoritosActual: number
}
