import { Restaurant } from "./types";

export function buildFunnelUrl(slug: string, appBaseUrl?: string): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL;
  const baseUrl = envUrl ? (envUrl.startsWith("http") ? envUrl : `https://${envUrl}`) : "http://localhost:3000";
  const base = (appBaseUrl ?? baseUrl).replace(/\/$/, "");
  return `${base}/funnel/${slug}`;
}

export function buildReviewTemplates(restaurantName: string): string[] {
  return [
    `Absolutely loved the food and ambience at ${restaurantName}. The service was quick and very courteous. Highly recommended!`,
    `Great experience at ${restaurantName}. Tasty food, clean place, and staff were very friendly. Will definitely visit again.`,
    `One of the best places for family dining. ${restaurantName} served delicious dishes with excellent hospitality.`,
    `Amazing quality and presentation. The team at ${restaurantName} made us feel welcome. Wonderful overall experience.`,
  ];
}

export function restaurantLabel(restaurant: Restaurant): string {
  return restaurant.name;
}
