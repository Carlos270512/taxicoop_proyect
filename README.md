# TaxiCoop — Monorepo

Sistema de gestión para la cooperativa de taxis **Pole Taxicoop**. Este repositorio
contiene el backend y el frontend en un solo lugar.

## Estructura

```text
taxicoop_proyect/
├── backend/            # API REST (Node.js + Express + TypeScript)
├── frontend/           # Panel de gestión (React + Vite + TypeScript)
├── requerimientos/     # Documentación y guías del equipo
├── .gitignore
├── .gitattributes
└── README.md
```

## Backend — `backend/`

API con arquitectura hexagonal por módulos (`domain` / `application` / `infrastructure`).

- **Stack:** Express 5, TypeScript, Sequelize (PostgreSQL), Mongoose (MongoDB), JWT + bcrypt.
- **Módulos:** Identity (usuarios y roles), Socios, Unidades, Emergencias, Votación.

### Puesta en marcha

```bash
cd backend
npm install
cp .env.example .env      # completar los valores reales
npm run dev               # http://localhost:3000
```

### Endpoints principales

| Método | Ruta | Autenticación |
|---|---|---|
| GET | `/api/health` | pública |
| POST | `/api/auth/register` | pública |
| POST | `/api/auth/login` | pública |
| POST / GET | `/api/auth/roles` | pública |
| POST / GET | `/api/socios` | pública |
| POST / GET | `/api/unidades` | pública |
| POST / GET | `/api/emergencias` | pública |
| POST | `/api/votacion/elections` | JWT |
| GET | `/api/votacion/elections/active` | JWT |
| POST | `/api/votacion/vote` | JWT |
| GET | `/api/votacion/elections/:id/results` | JWT |

### Variables de entorno

Ver `backend/.env.example`. **Nunca** se versiona el archivo `.env` real.

## Frontend — `frontend/`

Panel administrativo en React 19 + Vite.

```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL apuntando al backend
npm run dev               # http://localhost:5173
```

> El login del frontend todavía valida localmente (modo demo). La conexión con
> `POST /api/auth/login` está pendiente.

## Buenas prácticas del repositorio

- Ningún archivo `.env` ni credencial se versiona: solo `.env.example`.
- `node_modules/` y `dist/` quedan fuera del repositorio.
- Los secretos (contraseñas de base de datos, `JWT_SECRET`, cadenas de conexión)
  se configuran por entorno.
