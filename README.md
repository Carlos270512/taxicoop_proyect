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

## Levantar todo con Docker (un solo comando)

```bash
cp .env.example .env      # completar POSTGRES_PASSWORD y JWT_SECRET
docker compose up -d --build
```

- Panel: `http://localhost:8080` (o el puerto que definas en `FRONTEND_PUBLISHED_PORT`).
- API a través de Nginx: `http://localhost:8080/api/...` (el front usa rutas relativas
  `/api`, así que no hay que recompilarlo por entorno ni hay problemas de CORS).
- PostgreSQL y MongoDB viven en la red interna de Docker, sin puertos publicados.
- Datos persistentes en los volúmenes `pg_data` y `mongo_data`.

```bash
docker compose ps                 # estado de los servicios
docker compose logs -f backend    # logs en vivo
docker compose down               # apaga (conserva datos)
docker compose down -v            # apaga y borra los datos
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
| GET | `/api/socios?q=&estado=&page=&limit=` | JWT |
| GET | `/api/socios/me` | JWT (perfil del socio autenticado + sus unidades) |
| GET | `/api/socios/:id` | JWT |
| POST | `/api/socios` | JWT · ADMIN |
| PUT | `/api/socios/:id` | JWT · ADMIN |
| PATCH | `/api/socios/:id/estado` | JWT · ADMIN |
| DELETE | `/api/socios/:id` | JWT · ADMIN (baja lógica → RETIRADO) |
| GET | `/api/unidades?socioId=&estado=&q=&page=&limit=` | JWT |
| GET | `/api/unidades/:id` | JWT |
| POST | `/api/unidades` | JWT · ADMIN |
| PUT | `/api/unidades/:id` | JWT · ADMIN |
| PATCH | `/api/unidades/:id/estado` | JWT · ADMIN |
| DELETE | `/api/unidades/:id` | JWT · ADMIN (baja lógica → SUSPENDIDA) |
| POST / GET | `/api/emergencias` | pública |
| GET | `/api/votacion/elections?status=&page=&limit=` | JWT |
| GET | `/api/votacion/elections/active` | JWT |
| GET | `/api/votacion/elections/:id` | JWT |
| GET | `/api/votacion/elections/:id/results` | JWT (resultados ocultos hasta el cierre, salvo ADMIN) |
| POST | `/api/votacion/elections` | JWT · ADMIN |
| PATCH | `/api/votacion/elections/:id/status` | JWT · ADMIN (DRAFT → ACTIVE → CLOSED) |
| POST | `/api/votacion/vote` | JWT (un voto por socio y elección) |
| GET | `/api/dashboard/summary` | JWT |
| GET | `/api/assistant/status` | JWT (si el asistente está configurado) |
| POST | `/api/assistant/chat` | JWT (límite 20 preguntas / 5 min por usuario) |

### Variables de entorno

Ver `backend/.env.example`. **Nunca** se versiona el archivo `.env` real.

### Migraciones

El esquema de PostgreSQL se gestiona con `sequelize-cli` (carpeta `backend/migrations`).
`npm run dev` aplica las migraciones pendientes automáticamente antes de arrancar;
también puedes hacerlo a mano:

```bash
npm run db:migrate        # aplica las pendientes
npm run db:migrate:undo   # revierte la última
npm run db:status         # estado de cada migración
```

Nunca se edita una migración ya aplicada: los cambios van en una migración nueva.

### Datos de demostración

```bash
npm run db:seed                                   # local
docker compose exec backend node scripts/seed-demo.js   # en Docker
```

Crea 2 socios, 2 unidades, 1 votación activa y 1 alerta de emergencia. Es idempotente.

## Frontend — `frontend/`

Panel administrativo en React 19 + Vite.

```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL apuntando al backend
npm run dev               # http://localhost:5173
```

> El login ya consume `POST /api/auth/login`: guarda el token JWT y lo envía en
> cada petición. Si el backend responde **401**, se cierra la sesión y se vuelve al login.

Módulos del panel ya conectados al backend: **Dashboard**, **Socios**, **Vehículos (Unidades)**
y **Votaciones** (`/votaciones` y `/votaciones/:id` con voto y resultados).

### Roles y acceso

| Rol | Panel de inicio | Menú |
|---|---|---|
| `ADMIN` | Resumen de la operación | Panel principal · Socios · Vehículos · Votaciones · Configuración |
| `SOCIO` | Espacio personal (estado, unidades y votaciones abiertas) | Panel principal · Mi perfil · Votaciones |

- `/perfil` consume `GET /api/socios/me` y muestra los datos del socio con sus unidades.
- Las rutas de administración (`/socios`, `/vehiculos`, `/unidades` y los módulos pendientes)
  están protegidas en el front con `RequireRole`; el backend vuelve a validar el rol.
- Módulos aún no terminados y ocultos en el menú: Conductores, Carreras, Pagos y Reportes.

## Asistente IA (DeepSeek)

Chat flotante (abajo a la derecha) disponible en todas las pantallas internas. Responde
preguntas sobre el sistema usando datos reales según el rol de la sesión.

```
frontend → POST /api/assistant/chat (JWT) → backend → api.deepseek.com
```

**La API key nunca llega al navegador.** Se configura solo en el backend:

```bash
# backend/.env  (NO se versiona)
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

En Docker las toma del `.env` de la raíz (mismas variables) y se pasan al servicio `backend`.

Detalles de seguridad y costo:

- El historial se recorta a los últimos 12 mensajes y se limita a 2000 caracteres por mensaje.
- Respuestas acotadas (`max_tokens` 700) y *timeout* de 25 s.
- Límite de 20 preguntas cada 5 minutos por usuario (en memoria).
- Sin key configurada el endpoint responde `503` con un mensaje claro en el chat.
- El asistente **solo informa** (no crea, edita ni borra registros) y el contexto de cada rol
  se arma en el backend: el socio solo recibe sus propios datos.

## Buenas prácticas del repositorio

- Ningún archivo `.env` ni credencial se versiona: solo `.env.example`.
- `node_modules/` y `dist/` quedan fuera del repositorio.
- Los secretos (contraseñas de base de datos, `JWT_SECRET`, cadenas de conexión)
  se configuran por entorno.
