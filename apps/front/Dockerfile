FROM denoland/deno:latest AS build-stage

# Set config
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_FUND=false

WORKDIR /app

COPY deno.json ./

RUN deno install 
RUN deno install --allow-scripts=npm:tesseract.js@6.0.1,npm:core-js@3.44.0,npm:unrs-resolver@1.11.1,npm:napi-postinstall@0.3.1

COPY . ./

RUN deno task build



FROM caddy:latest

COPY ./Caddyfile /etc/caddy/Caddyfile

RUN caddy fmt /etc/caddy/Caddyfile --overwrite

COPY --from=build-stage /app/dist/ /usr/share/caddy
