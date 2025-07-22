FROM denoland/deno:latest AS build-stage

WORKDIR /app

COPY deno.json ./

ENV DENO_DIR=/.deno_cache
RUN deno install 
RUN deno install --allow-scripts=npm:tesseract.js@6.0.1,npm:napi-postinstall@0.3.1

COPY . ./

RUN deno task build


FROM caddy:latest

COPY ./Caddyfile /etc/caddy/Caddyfile

RUN caddy fmt /etc/caddy/Caddyfile --overwrite

COPY --from=build-stage /app/dist/ /usr/share/caddy
