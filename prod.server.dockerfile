# syntax=docker/dockerfile:1
#
# Minimal production image for @openmario/server.
# Build:  docker build -f prod.server.dockerfile -t openmario-server .
# Run:    docker run --env-file .env -p 3000:3000 openmario-server
#
# apps/server/build.ts uses `packages: 'bundle'`, so the final stage only
# needs the single bundled JS file + the Bun runtime.

############################################
# 1) Install deps for the server graph only
############################################
FROM oven/bun:1.4-alpine AS deps
WORKDIR /app

# Manifests first for better layer caching. Extra workspace package.json
# files are required so --frozen-lockfile can validate bun.lock on Bun 1.4.
COPY package.json bun.lock ./
COPY apps/server/package.json ./apps/server/
COPY apps/client/package.json ./apps/client/
COPY apps/mcp/package.json ./apps/mcp/
COPY apps/scraper/package.json ./apps/scraper/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/db/package.json ./packages/db/
COPY packages/meilisearch/package.json ./packages/meilisearch/
COPY packages/scraper/package.json ./packages/scraper/

# Server workspace + root (root provides @dotenvx/dotenvx used by env.ts).
RUN bun install --frozen-lockfile \
	--filter '@openmario/server' \
	--filter './'

############################################
# 2) Copy sources and produce dist/index.js
############################################
FROM deps AS build
WORKDIR /app

COPY tsconfig.json ./
COPY apps/server ./apps/server
COPY packages/contracts ./packages/contracts
COPY packages/db ./packages/db
COPY packages/meilisearch ./packages/meilisearch

ENV NODE_ENV=production

RUN bun run --filter '@openmario/server' build \
	&& rm -f apps/server/dist/*.map

############################################
# 3) Runtime — bundled JS only (~3MB + Bun)
############################################
FROM oven/bun:1.4-alpine AS production-server
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/apps/server/dist/index.js ./index.js

# Used by docker-compose healthcheck and the built-in HEALTHCHECK below.
COPY <<'EOF' ./healthcheck.ts
const port = Number(process.env.PORT ?? 3001);
const res = await fetch(`http://127.0.0.1:${port}/api/health`);
if (!res.ok) process.exit(1);
EOF

USER bun
EXPOSE 3000 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
	CMD bun run /app/healthcheck.ts

CMD ["bun", "run", "./index.js"]
