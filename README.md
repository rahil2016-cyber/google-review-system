# AI Reputation Management Platform

Production-oriented multi-tenant SaaS foundation for review management, CRM, campaigns, loyalty, AI insights, and billing.

## Included in this repository

- Existing Next.js review funnel frontend (`src/`)
- Firebase functions legacy integration (`functions/`)
- New backend API gateway scaffold (`apps/api-gateway/`)
- New worker scaffold for async jobs (`apps/worker/`)
- Shared contracts package (`packages/types/`)
- Multi-tenant Prisma data model (`prisma/schema.prisma`)
- Production blueprint documentation (`docs/AI_REPUTATION_SAAS_CTO_BLUEPRINT.md`)
- Container and CI templates (`docker-compose.yml`, `.github/workflows/ci.yml`)

## Quick start

1. Install dependencies:
   - `npm install`
2. Copy and configure env:
   - `cp .env.example .env.local`
3. Start frontend:
   - `npm run dev`
4. Start API gateway:
   - `npm run dev:api`
5. Start worker:
   - `npm run dev:worker`

Frontend runs at `http://localhost:3000`, API at `http://localhost:4000`.

## Restaurant admin panel

1. Set `NEXT_PUBLIC_ADMIN_KEY` and `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000` in `.env.local`.
2. Open `http://localhost:3000/admin` and enter the admin key.
3. Add a restaurant name + Google review URL → a customer QR and funnel link are generated.
4. Print or download the QR and place it on tables. Customers scan to open `/funnel/{slug}`.

## Local infra with Docker

- `docker compose up --build`

This starts Postgres, Redis, API gateway, and worker.

## Core commands

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run build:api`
- `npm run build:worker`
- `npm run prisma:generate`

## Architecture and implementation references

- Product/system design: `docs/AI_REPUTATION_SAAS_CTO_BLUEPRINT.md`
- Data model: `prisma/schema.prisma`
