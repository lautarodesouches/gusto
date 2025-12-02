# Landing Page Estática - Gusto

Esta carpeta contiene la versión estática completa de la landing page de Gusto, lista para ser desplegada en cualquier servidor web.

## 📁 Estructura

```
landing/
├── index.html          # Página principal
├── style.css           # Estilos consolidados
├── README.md           # Este archivo
└── images/             # Recursos gráficos
    ├── all/            # Imágenes generales
    ├── brand/          # Logos y marca
    └── cursor/         # Cursores personalizados
```

## 🚀 Cómo usar

### Opción 1: Servidor local
```bash
# Navega a la carpeta landing
cd landing

# Con Python
python -m http.server 8000

# Con Node.js
npx http-server -p 8000

# Con PHP
php -S localhost:8000
```

Luego abre `http://localhost:8000` en tu navegador.

### Opción 2: Deploy a producción

Esta carpeta está lista para ser desplegada en cualquier hosting estático:

- **Netlify**: Arrastra la carpeta `landing` a netlify.com/drop
- **Vercel**: `vercel --prod` desde la carpeta `landing`
- **GitHub Pages**: Sube la carpeta al repositorio
- **Servidor tradicional**: Copia el contenido vía FTP

## 🔗 Enlaces configurados

Todos los enlaces de navegación apuntan al dominio principal de la aplicación:
- **Dominio**: `https://gusto-dusky.vercel.app`
- **Rutas**:
  - Login: `/auth/login`
  - Registro: `/auth/register`
  - Registro de restaurante: `/restaurante/agregar`

## 🎨 Características

✅ **100% estático** - Solo HTML, CSS y JavaScript vanilla
✅ **Responsive** - Optimizado para móvil y desktop
✅ **Interactivo** - Menú móvil, acordeón FAQ, smooth scroll
✅ **Completo** - Todas las imágenes y recursos incluidos
✅ **Sin dependencias** - No requiere Node.js, React ni Next.js

## 🖼️ Fuentes

- **Plus Jakarta Sans**: Se carga desde Google Fonts
- **Gliker**: Definida en variables CSS (si no está disponible, se usa fallback)

## 📝 Notas técnicas

- Las rutas de imágenes son relativas a `index.html`
- Los cursores personalizados están en `images/cursor/`
- Los enlaces internos usan anchors (`#inicio`, `#beneficios`, `#faq`)
- Los enlaces externos apuntan a la app principal en Vercel

## 🛠️ Personalización

Para cambiar el dominio de la aplicación, edita en `index.html`:
- Línea 28: `href="https://gusto-dusky.vercel.app/restaurante/agregar"`
- Línea 33: `href="https://gusto-dusky.vercel.app/auth/login"`
- Línea 38: `href="https://gusto-dusky.vercel.app/auth/register"`
- Línea 89: `href="https://gusto-dusky.vercel.app/auth/register"`

## 📦 Recursos incluidos

### Imágenes generales (images/all/)
- poster.jpg - Hero image
- carrusel.svg - Elemento decorativo
- beneficios.svg - Ilustración de beneficios
- bot.svg, hamburguesa.svg, cronometro.svg, estrella.svg - Iconos
- asterisco.svg - Bullet point personalizado
- aplicacion-gusto.png - Screenshot de la app

### Marca (images/brand/)
- gusto-no-slogan.svg - Logo header
- gusto-center-negative.svg - Logo footer

### Cursores (images/cursor/)
- pointer-arrow-mini.png - Cursor normal
- pointer-hand-mini.png - Cursor hover
- pointer-active-mini.png - Cursor activo
