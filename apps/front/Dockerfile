FROM denoland/deno:latest AS build-stage

# Set config
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_FUND=false

WORKDIR /app

COPY deno.json ./

RUN deno install 

COPY . ./

RUN npm task build


FROM caddy:latest

COPY ./Caddyfile /etc/caddy/Caddyfile

RUN caddy fmt /etc/caddy/Caddyfile --overwrite

COPY --from=build-stage /app/dist/ /usr/share/caddy
