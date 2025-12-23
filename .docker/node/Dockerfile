# Stage 1: Base
FROM node:20-alpine AS base
WORKDIR /app
ARG PORT=3000
ENV PORT=$PORT
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

# Stage 2: Build
FROM base AS build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Production
FROM base AS production
ENV NODE_ENV=production
# Copy built output
COPY --from=build /app/.output /app/.output
# Optional: Copy public folder if needed
# COPY --from=build /app/public /app/public

EXPOSE $PORT

CMD ["node", ".output/server/index.mjs"]
