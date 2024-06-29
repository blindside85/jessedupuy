FROM node:lts AS base
WORKDIR /app

COPY . .
RUN npm install

FROM base AS builder
WORKDIR /app

RUN npm run build

FROM nginx:1.26-alpine-slim as website

COPY --from=builder /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
