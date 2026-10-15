FROM node:lts AS base
WORKDIR /app

COPY . .
RUN npm install

FROM base AS builder
WORKDIR /app

RUN npm run build

# stable follows nginx's current stable line, like node:lts does for Node
FROM nginx:stable-alpine-slim AS website

COPY --from=builder /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
