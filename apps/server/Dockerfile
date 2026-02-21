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

# ===== PRODUCTION STAGE - SERVER =====
FROM oven/bun:1.3.0-slim AS production-server

WORKDIR /app

COPY --from=build-stage  /usr/src/app/scripts/healthcheck.ts ./
COPY --from=build-stage  /usr/src/app/apps/server/dist ./

# Expose port
EXPOSE 3000

# Start server
CMD ["bun", "run", "index.js"]
