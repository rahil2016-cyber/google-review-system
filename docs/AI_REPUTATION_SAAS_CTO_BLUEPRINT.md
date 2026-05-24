# AI Reputation SaaS - Production CTO Blueprint

## 1) Product Architecture

### Core architecture
- Multi-tenant SaaS with strict tenant isolation (`tenant_id` everywhere + Postgres RLS).
- Start with modular monolith + queue workers; split into microservices by domain load:
  - Identity/Auth
  - Tenant + Branch
  - Reviews
  - CRM
  - Campaigns
  - Loyalty/Referrals
  - Billing
  - AI
  - Analytics
  - Notifications
- API Gateway/BFF in front of services for:
  - Auth verification
  - RBAC policy enforcement
  - Rate limiting
  - Request tracing/correlation IDs
  - Versioning and deprecation controls

### Event-driven design
- Use SQS/SNS (or Kafka if very high throughput) for domain events:
  - `review.received`, `review.replied`
  - `customer.created`, `customer.updated`
  - `campaign.scheduled`, `message.delivered`, `message.failed`
  - `subscription.changed`
  - `ai.job.started`, `ai.job.completed`
- Apply outbox pattern for reliable event publication.
- Ensure idempotent consumers with dedupe keys.

### High availability and scale
- Edge: CloudFront + WAF + Shield.
- Compute: EKS with HPA + PodDisruptionBudgets.
- Data: RDS Postgres Multi-AZ + read replicas + PITR.
- Caching: ElastiCache Redis (tenant-aware keys + TTL).
- Storage: S3 (SSE-KMS, lifecycle policies).
- Ingress: Nginx ingress with canary deployments.

## 2) Database Design Strategy

Use `prisma/schema.prisma` in this repo as baseline (added in this task).

### Data modeling principles
- Every mutable table includes:
  - `tenantId`
  - `createdAt`, `updatedAt`
  - `deletedAt` (soft delete for business objects)
- All external IDs are scoped unique by tenant.
- Append-only ledger tables for finance, points, and compliance logs.

### Partitioning and indexing
- Partition analytics/event tables monthly.
- Composite indexes:
  - `(tenantId, createdAt desc)`
  - `(tenantId, branchId, status)`
  - `(tenantId, customerId)`
- Partial indexes on active rows (`deletedAt IS NULL`).
- Full text/trigram index for review text and customer search fields.

## 3) Authentication and Security

### Auth model
- JWT access tokens (10-15m), RS256, key rotation via KMS.
- Refresh token rotation with token family invalidation.
- OAuth providers: Google first, extensible providers table.
- 2FA: TOTP + backup codes.

### Security controls
- OWASP ASVS controls:
  - Input validation (zod)
  - Output escaping
  - CSRF protection (cookie mode)
  - SSRF and file-upload hardening
- HTTP security:
  - HSTS, CSP, X-Frame-Options, Referrer-Policy
- Secrets:
  - AWS Secrets Manager; no secrets in code.
- Audit:
  - immutable `audit_logs`
  - signed webhook payload verification.

### Compliance
- GDPR:
  - Data export (DSAR)
  - Data deletion workflows
  - Retention policies per domain
- PII encryption for sensitive fields using envelope encryption.

## 4) Frontend Architecture (Next.js 15)

### App architecture
- `app/` route groups by persona:
  - `(auth)`
  - `(super-admin)`
  - `(business-admin)`
  - `(branch-manager)`
  - `(staff)`
- Typed API client generated from OpenAPI.
- TanStack Query for server state; Zustand for local UI state.

### Design system
- Tailwind + shadcn/ui + tokenized theme.
- Atomic layers:
  - primitives
  - composed components
  - feature components
  - pages

### Performance and accessibility
- Server Components default, Client Components by need.
- Dynamic import for charts/heavy modules.
- WCAG 2.2 AA compliance baseline.

## 5) Admin Dashboard Modules

### Super Admin
- Tenant lifecycle, global analytics, abuse/risk, billing ops.

### Business Admin
- Branch control, review operations, CRM, campaigns, subscriptions.

### Branch Manager
- Branch KPIs, response queue, staff, local campaign actions.

### Staff
- Customer interactions, follow-ups, resolved tasks.

## 6) Customer Feature Flows

### Google review flow
1. Customer trigger (POS/booking/manual)
2. Send request (WhatsApp/SMS/email)
3. Deep link to Google review
4. Track conversion and response SLA

### QR/NFC flow
1. Scan/tap branch or table-specific token
2. Smart redirect by platform
3. Prompt for rating
4. Route low ratings to private feedback, high ratings to Google

### Retention and rewards
- Event-based loyalty points.
- Coupon and referral issuance with anti-fraud checks.
- Automated win-back campaigns for churn-risk users.

## 7) AI Architecture

### AI workflows
- Review reply generation
- Sentiment and emotion classification
- Complaint/root-cause extraction
- Weekly executive summary generation
- Churn propensity scoring
- Campaign copy generation

### AI reliability and cost
- Prompt registry with versioning.
- Strict token budgets by tenant and feature.
- Semantic caching for repeated contexts.
- Tiered models by task complexity.
- Human-in-the-loop for sensitive outputs.

## 8) WhatsApp Automation

- Template approval lifecycle and localization.
- Segmentation from CRM tags/events.
- Trigger orchestration from event bus.
- Delivery and read tracking via webhook ingestion.
- Retry strategy with exponential backoff and DLQ.
- Consent and opt-out compliance state machine.

## 9) Analytics System

### KPI dashboards
- Review growth and rating distribution
- Branch performance comparison
- Campaign funnel and ROI
- Customer growth and retention
- Sentiment trends
- Revenue and plan health

### Data strategy
- OLTP in Postgres.
- Rollups/materialized views for dashboards.
- Optional warehouse for heavy analytics at scale.

## 10) CRM System

- Unified customer profile
- Contact timeline
- Notes and tags
- Segment builder
- Campaign interaction logs
- Loyalty and referrals state
- Risk and retention score

## 11) Subscription and Billing

- Plans: Starter, Growth, Pro, Enterprise.
- Metered billing dimensions:
  - branch count
  - messages sent
  - AI tokens
  - active contacts
- Stripe + Razorpay abstraction via `billing_provider` layer.
- Webhook idempotency and replay protection.

## 12) DevOps and Deployment

- Docker multi-stage builds (distroless runtime).
- EKS deployment via Helm.
- GitHub Actions:
  - lint -> test -> build -> security scan -> deploy
- Observability:
  - OpenTelemetry traces
  - Prometheus/Grafana or Datadog
  - Alerting by SLO
- Disaster Recovery:
  - RTO < 2h, RPO < 15m
  - Quarterly restore drills

## 13) Mobile App (React Native)

- Offline-first queue for field/staff actions.
- QR scanner and NFC handling.
- Push notifications with FCM/APNS.
- Branch task inbox, customer profile quick actions, review handling.

## 14) API Design

- Versioned REST: `/api/v1/...`
- Resource-first naming.
- Error shape using problem details + `correlationId`.
- OpenAPI-first development and generated SDKs.

## 15) Recommended Packages

- Backend:
  - `express`, `prisma`, `zod`, `pino`, `bullmq`, `ioredis`, `jose`, `argon2`
- Frontend:
  - `next`, `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod`
- AI:
  - `openai`, `langchain`, `tiktoken`
- Infra/Sec:
  - `helmet`, `rate-limiter-flexible`, `@opentelemetry/*`

## 16) Monorepo Target Structure

```text
apps/
  web/
  admin/
  api-gateway/
  worker/
  mobile/
packages/
  ui/
  types/
  config/
  ai/
infra/
  terraform/
  helm/
  github-actions/
prisma/
  schema.prisma
docs/
  AI_REPUTATION_SAAS_CTO_BLUEPRINT.md
```

## 17) MVP vs Advanced Roadmap

### MVP (0-6 months)
- Tenant onboarding + RBAC + branch management
- Google review collection + reply workflows
- Basic CRM + campaigns
- Billing subscriptions + basic analytics
- AI reply draft + sentiment classification

### Advanced (6-24 months)
- White-label agency mode
- Franchise hierarchy
- Predictive churn and autonomous campaigns
- API monetization and marketplace integrations
- Enterprise governance and data residency

## 18) Engineering Best Practices

- Trunk-based dev + feature flags.
- Strict type safety end-to-end.
- Contract tests between gateway and domain services.
- Backward-compatible APIs.
- SLO-driven development with error budgets.
- Security and compliance checks in CI.

## 19) Startup Monetization Expansion

- Multi-plan SaaS subscriptions.
- Usage-based add-ons.
- White-label and agency plans.
- API access tiers.
- Managed reputation services marketplace.

## 20) Immediate Next Build Steps

1. Finalize Prisma migrations from provided schema.
2. Build auth/tenant/branch/review APIs first.
3. Add queue workers for messaging and AI jobs.
4. Launch billing integration with webhook safety.
5. Ship v1 analytics and role-based dashboards.
