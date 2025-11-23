/**
 * Re-exports de todos los tipos de la aplicación
 * 
 * Este archivo mantiene compatibilidad con imports existentes
 * mientras los tipos están organizados en archivos separados por dominio
 */

// Tipos comunes
export type { ApiResponse, Coordinates } from './common'

// Tipos de usuario
export type { User, UsuarioSimpleResponse } from './user'

// Tipos de restaurantes
export type { 
    Restaurant, 
    Review, 
    Gusto, 
    Restriccion,
    RestauranteMenu,
    CategoriaMenu,
    ItemMenu,
    PrecioMenu,
    RestauranteMetricasDashboard
} from './restaurant'

// Tipos de grupos
export type { Group, GroupMember } from './group'

// Tipos sociales
export type { Friend, FriendInvitation, SocialData, SolicitudAmistadResponse } from './social'

// Tipos de pagos
export type { PlanUsuario, BeneficiosPremium, LimiteGruposResponse, CrearPagoRequest, CrearPagoResponse, PagoError } from './payment'

// Tipos de registro
export type { RegisterItem, Field, FormState, ResponseRegister } from './register'

// Tipos de filtros
export type { Filter, Filters } from './filters'

// Tipos de perfil
export type { UserResumen, UpdateProfilePayload } from './profile'

// Tipos de votación
export type {
    EstadoVotacion,
    Votacion,
    Voto,
    VotanteInfo,
    RestauranteVotado,
    ResultadoVotacion,
    IniciarVotacionRequest,
    RegistrarVotoRequest
} from './voting'

// Tipos de solicitudes de restaurante
export type {
    SolicitudRestaurante,
    SolicitudStatus,
    SolicitudRestauranteBackend,
    ItemSimpleBackend,
    DatosSolicitudRestauranteBackend,
    HorarioSimpleDto,
    SolicitudRestauranteDetalleBackend,
    SolicitudRestauranteDetalle
} from './restaurant-request'
