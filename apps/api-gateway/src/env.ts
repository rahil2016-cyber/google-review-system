import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  API_PREFIX: z.string().default("/api/v1"),
  JWT_SECRET: z.string().min(16).default("dev-secret-change-in-production"),
  CORS_ORIGIN: z.string().default("*"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_DAYS: z.coerce.number().int().positive().default(30),
  DEFAULT_TENANT_SLUG: z.string().default("default-tenant"),
  DEFAULT_TENANT_NAME: z.string().default("Default Tenant"),
});

export const env = envSchema.parse(process.env);
