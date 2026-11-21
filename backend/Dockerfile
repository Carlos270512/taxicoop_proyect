# ==========================================================
# Backend TaxiCoop - imagen de produccion (multi-stage)
# ==========================================================
FROM node:22-bookworm-slim AS build

WORKDIR /app

# Cache de dependencias: primero manifiestos, luego el codigo
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build && npm prune --omit=dev

# ----------------------------------------------------------
FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Migraciones: el contenedor las aplica al arrancar
COPY .sequelizerc ./
COPY config ./config
COPY migrations ./migrations
COPY scripts ./scripts

USER node

EXPOSE 3000

CMD ["sh", "-c", "npx sequelize-cli db:migrate && exec node dist/main.js"]
