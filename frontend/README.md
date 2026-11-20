# Pole Taxicoop

Frontend inicial para el sistema de gestión de Pole Taxicoop.

## Requisitos

- Node.js 20.19+ o 22.12+
- npm

## Instalar y ejecutar

```bash
npm install
cp .env.example .env
npm run dev
```

Abre la dirección local que muestra Vite en la terminal.

## Acceso al panel (demo offline)

El login no consume la API: valida las credenciales localmente y guarda la sesión en el navegador.

- Usuario: `admin`
- Contraseña: `taxicoop`
- Correo alternativo: `admin@poletaxicoop.com`

En la tarjeta de acceso puedes pulsar **usar admin / taxicoop** para autocompletar. Si marcas «Recordarme», la sesión se guarda en `localStorage`; si no, en `sessionStorage`. El botón de cerrar sesión está en el menú del usuario.

## Conectar la API

En `.env`, configura la URL base del backend:

```env
VITE_API_URL=http://localhost:3000/api
```

La instancia Axios está en `src/services/api.ts`. Las pantallas y endpoints reales se agregan cuando definamos las rutas y respuestas de la API.

## Dependencias principales

- React y React DOM: interfaz.
- React Router: navegación.
- TanStack Query: consultas y caché de la API.
- Axios: solicitudes HTTP.
- Framer Motion: animaciones y transiciones de la interfaz.
- Lucide React: iconos.
- Vite y TypeScript: desarrollo y compilación.
