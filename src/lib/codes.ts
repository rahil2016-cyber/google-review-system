import { randomBytes } from "node:crypto";

export function generateUniqueCode(length = 8): string {
  return randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length)
    .toLowerCase();
}

export function slugifyBusinessName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function buildPublicRatingUrl(uniqueCode: string, appUrl?: string): string {
  const appEnv = process.env.NEXT_PUBLIC_APP_URL;
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL;

  // If NEXT_PUBLIC_APP_URL is set and isn't localhost, use it (production override)
  // Otherwise fall back to the Vercel-provided URL, then localhost for dev
  let envUrl: string | undefined;
  if (appEnv && !appEnv.includes("localhost")) {
    envUrl = appEnv;
  } else if (vercelUrl) {
    envUrl = vercelUrl;
  } else {
    envUrl = appEnv; // localhost fallback for local dev
  }

  const baseUrl = envUrl ? (envUrl.startsWith("http") ? envUrl : `https://${envUrl}`) : "http://localhost:3000";
  const base = (appUrl ?? baseUrl).replace(/\/$/, "");
  return `${base}/r/${uniqueCode}`;
}
