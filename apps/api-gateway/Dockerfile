FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
COPY apps/api-gateway/package*.json ./apps/api-gateway/
COPY packages/types/package*.json ./packages/types/
RUN npm install

COPY apps/api-gateway ./apps/api-gateway
COPY packages/types ./packages/types
RUN npm --workspace @repo/types run build
RUN npm --workspace @repo/api-gateway run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/api-gateway/dist ./apps/api-gateway/dist
COPY --from=base /app/apps/api-gateway/package.json ./apps/api-gateway/package.json

EXPOSE 4000
CMD ["node", "apps/api-gateway/dist/index.js"]
