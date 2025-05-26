# build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci

# Not cool, but otherwise claude needs to pass the .env file to the container on run
# Should be fine for the demo
COPY .env .env

COPY src/ src/
RUN npm run build

# production image
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/.env .env
# entrypoint will simply run the stdio server
CMD ["node", "build/index.js"]
