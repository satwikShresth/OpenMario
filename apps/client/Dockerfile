# ===== BASE STAGE =====
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# ===== INSTALL STAGE =====
FROM base AS install
# Copy entire project for dependency installation
COPY . .
# Install all dependencies - let Bun set up workspace properly
RUN bun install

# ===== BUILD STAGE =====
FROM install AS build-stage

# Build args for client environment variables
ARG VITE_APP_TITLE
ARG VITE_LR_APP_ID
ARG VITE_MEILI_HOST
ARG VITE_DISCORD_WEBHOOK

# Set environment variables for Vite build
ENV NODE_ENV=production
ENV VITE_APP_TITLE=${VITE_APP_TITLE}
ENV VITE_LR_APP_ID=${VITE_LR_APP_ID}
ENV VITE_MEILI_HOST=${VITE_MEILI_HOST}
ENV VITE_DISCORD_WEBHOOK=${VITE_DISCORD_WEBHOOK}

# Build the application
RUN bun run build

# ===== PRODUCTION STAGE - CLIENT =====
FROM caddy:latest  AS production-client

COPY ./apps/client/Caddyfile /etc/caddy/Caddyfile
RUN caddy fmt /etc/caddy/Caddyfile --overwrite
COPY --from=build-stage /usr/src/app/apps/client/dist/ /usr/share/caddy
