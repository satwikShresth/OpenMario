FROM node:lts-alpine AS build-stage

# Set config
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_FUND=false

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . ./

RUN npm run build


FROM caddy:latest

COPY ./Caddyfile /etc/caddy/Caddyfile

RUN caddy fmt /etc/caddy/Caddyfile --overwrite

COPY --from=build-stage /app/dist/ /usr/share/caddy
