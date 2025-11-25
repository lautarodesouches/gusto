# Gusto

Gusto es una aplicación web para descubrir, calificar y compartir restaurantes con amigos.

## Tecnologías

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Estilos**: CSS Modules, FontAwesome
- **Base de Datos / Backend**: .NET Core API (Externo)
- **Autenticación**: Firebase Auth (Google, Apple, Email/Password)
- **Mapas**: Google Maps API

## Características Principales

- **Exploración**: Mapa interactivo para encontrar restaurantes cercanos.
- **Social**: Sigue a amigos, crea grupos y ve sus recomendaciones.
- **Restaurantes**: Detalles completos, menús, fotos y reseñas.
- **Dueños**: Dashboard para gestionar restaurantes propios.
- **Gamificación**: Sistema de niveles y logros (en desarrollo).

## Configuración Local

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/lautarodesouches/gusto.git
    cd gusto
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Variables de Entorno**:
    Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

    ```env
    NEXT_PUBLIC_API_URL=https://tu-api-backend.com
    NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_google_maps_key
    ```

4.  **Correr el servidor de desarrollo**:
    ```bash
    npm run dev
    ```

    Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

- `/app`: Rutas y páginas de Next.js (App Router).
- `/components`: Componentes reutilizables de React.
- `/context`: Contextos de React (Auth, etc.).
- `/hooks`: Custom hooks.
- `/types`: Definiciones de tipos TypeScript.
- `/utils`: Funciones de utilidad.
- `/public`: Archivos estáticos.

## Contribuir

1.  Crea una rama para tu feature (`git checkout -b feature/nueva-feature`).
2.  Haz commit de tus cambios (`git commit -m 'Add: nueva feature'`).
3.  Haz push a la rama (`git push origin feature/nueva-feature`).
4.  Abre un Pull Request.
