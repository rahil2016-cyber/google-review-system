import { Restaurant } from "./types";

export function buildFunnelUrl(slug: string, appBaseUrl?: string): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL;
  const baseUrl = envUrl ? (envUrl.startsWith("http") ? envUrl : `https://${envUrl}`) : "http://localhost:3000";
  const base = (appBaseUrl ?? baseUrl).replace(/\/$/, "");
  return `${base}/funnel/${slug}`;
}

export function buildReviewTemplates(businessName: string): string[] {
  return [
    `Absolutely loved the service and atmosphere at ${businessName}. The team was quick, professional, and very courteous. Highly recommended!`,
    `Great experience with ${businessName}. High-quality service, clean environment, and staff were very friendly. Will definitely visit again.`,
    `One of the best places for professional and reliable service. ${businessName} delivered excellent hospitality and support.`,
    `Amazing quality and attention to detail. The team at ${businessName} made us feel welcome and the overall experience was wonderful.`,
  ];
}

export function restaurantLabel(restaurant: Restaurant): string {
  return restaurant.name;
}
