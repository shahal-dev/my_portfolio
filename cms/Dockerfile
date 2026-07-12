# node:20-slim, not alpine — Strapi's own docs warn alpine's musl libc causes
# problems with sharp/native image-processing bindings. Matters more here
# since Oracle free-tier VMs are commonly ARM (Ampere A1): native deps like
# better-sqlite3 need a working toolchain to compile if no prebuilt binary
# matches the platform, hence build-essential/python3 below.

FROM node:20-slim AS build
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ENV NODE_ENV=production

# `strapi build` loads the full app config (including config/server.ts's
# required APP_KEYS), but no .env exists at build time — real secrets are
# only supplied at *runtime* via docker-compose's env_file. These
# placeholders exist solely so the build step doesn't fail on missing
# required config; they're never used for anything at runtime.
ENV APP_KEYS=buildKey1,buildKey2 \
    API_TOKEN_SALT=buildtimeplaceholder \
    ADMIN_JWT_SECRET=buildtimeplaceholder \
    TRANSFER_TOKEN_SALT=buildtimeplaceholder \
    JWT_SECRET=buildtimeplaceholder \
    ENCRYPTION_KEY=buildtimeplaceholder \
    DATABASE_CLIENT=sqlite

RUN npm run build
RUN npm prune --omit=dev

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app .

EXPOSE 1337
CMD ["npm", "run", "start"]
