# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:20 AS build-stage
WORKDIR /app
COPY package*.json /app/
RUN npm install
COPY ./ /app/
RUN npm run build


FROM caddy:latest AS production-stage
COPY --from=build-stage /app/dist/ /usr/share/caddy


FROM node:20 AS development-stage
WORKDIR /app
COPY package*.json /app/
RUN npm install

COPY ./ /app/
