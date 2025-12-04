# Datos Mockeados - Distrito Sabor

Este directorio contiene datos de demostración para el restaurante **Distrito Sabor**.

## Restaurante

- **ID**: `da5cc2dd-a814-49f6-d25b-08de302febdb`
- **Nombre**: Distrito Sabor
- **Tipo**: Restaurante Gastronómico

## Archivos

### 1. `distrito-sabor-reviews.json`

Contiene 10 reseñas de clientes para el restaurante Distrito Sabor.

**Características:**
- Valoraciones variadas (3.5 a 5.0 estrellas)
- Usuarios ficticios con avatares
- Fechas de visita de octubre-noviembre 2025
- Imágenes de ejemplo (URLs de Unsplash)
- Experiencias gastronómicas variadas

**Estructura:**
```typescript
interface Review {
  id: string
  restauranteId: string
  titulo: string
  opinion: string
  valoracion: number
  fechaCreacion: string
  fechaVisita: string
  mesAnioVisita: string
  motivoVisita: string
  usuario: {
    nombre: string
    username: string
    fotoPerfilUrl: string
  }
  usuarioId: string
  fotos: Array<{ id: string; url: string }>
  esImportada: boolean
}
```

### 2. `distrito-sabor-favoritos-por-dia.json`

Contiene estadísticas de favoritos por día durante los últimos 30 días.

**Datos:**
- **Total de favoritos**: 72
- **Promedio diario**: 2.4 favoritos/día
- **Período**: 30 días (4 nov - 3 dic 2025)
- **Tendencia**: Creciente

**Estructura:**
```typescript
interface FavoritosPorDia {
  restauranteId: string
  nombreRestaurante: string
  periodo: string
  favoritosPorDia: Array<{
    fecha: string
    cantidad: number
  }>
  estadisticas: {
    totalFavoritos: number
    promedioFavoritosPorDia: number
    diaConMasFavoritos: { fecha: string; cantidad: number }
    diaConMenosFavoritos: { fecha: string; cantidad: number }
    tendencia: string
  }
}
```

## Uso

Los datos mockeados se cargan automáticamente cuando se detecta que el ID del restaurante es el de Distrito Sabor.

### Funciones que usan datos mockeados:

#### 1. `getRestaurant(id)` - Reviews
En `app/actions/restaurant.ts`, cuando `id === DISTRITO_SABOR_ID`:
- Carga las reviews desde `distrito-sabor-reviews.json`
- Reemplaza las reviews del backend con los datos mock
- Si falla la carga, continúa con el flujo normal

#### 2. `getRestaurantMetrics(id)` - Métricas del Dashboard
En `app/actions/restaurant.ts`, cuando `id === DISTRITO_SABOR_ID`:
- Carga los favoritos por día desde `distrito-sabor-favoritos-por-dia.json`
- Genera métricas congruentes:
  - `totalVisitasPerfil`: 72 (congruente con favoritos)
  - `totalTop3Individual`: 45
  - `totalTop3Grupo`: 23
  - `favoritosPorDia`: datos del archivo mock

## Beneficios

✅ **Datos realistas**: Reviews y estadísticas creíbles para demostración
✅ **Independencia del backend**: No requiere datos reales en el servidor
✅ **Congruencia**: Las métricas están alineadas (72 visitas ≈ 72 favoritos totales)
✅ **Fácil modificación**: Los archivos JSON se pueden editar directamente
✅ **Fallback seguro**: Si algo falla, el sistema usa los datos del backend

## Modificación

Para actualizar los datos mockeados:

1. Edita los archivos JSON directamente
2. Asegúrate de mantener la estructura de datos
3. Verifica que las fechas y números sean congruentes
4. El sistema recargará automáticamente con los nuevos datos

## Notas

- Los datos solo se usan para el restaurante con ID `da5cc2dd-a814-49f6-d25b-08de302febdb`
- Si los archivos no existen, el sistema usa datos del backend sin errores
- Las imágenes de las reviews usan URLs de Unsplash como placeholder
- Los avatares usan pravatar.cc para generar avatares consistentes
