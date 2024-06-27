# Build stage
FROM node:lts AS build
WORKDIR /app
COPY . .
RUN npm i
RUN npm run build

# Runtime stage
FROM node:lts-slim AS runtime
WORKDIR /app
RUN npm install -g http-server
COPY --from=build /app/dist /app/dist

# Expose port 8080 and serve the static files
EXPOSE 8080
CMD ["http-server", "dist", "-p", "8080"]
