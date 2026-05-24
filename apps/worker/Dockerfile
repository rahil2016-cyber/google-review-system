FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
COPY apps/worker/package*.json ./apps/worker/
RUN npm install

COPY apps/worker ./apps/worker
RUN npm --workspace @repo/worker run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/worker/dist ./apps/worker/dist
COPY --from=base /app/apps/worker/package.json ./apps/worker/package.json

CMD ["node", "apps/worker/dist/index.js"]
