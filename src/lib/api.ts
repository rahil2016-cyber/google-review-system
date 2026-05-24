import {
  BusinessLoginPayload,
  BusinessLoginResponse,
  CreateRestaurantPayload,
  FeedbackEntry,
  FeedbackPayload,
  ReplySuggestionRequest,
  Restaurant,
} from "./types";

const functionsBaseUrl = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL?.replace(/\/$/, "");
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
const resolvedBaseUrl = apiBaseUrl || functionsBaseUrl;
const apiPrefix = "/api/v1";

if (!resolvedBaseUrl) {
  console.warn("Missing NEXT_PUBLIC_API_BASE_URL / NEXT_PUBLIC_FUNCTIONS_BASE_URL. API calls will fail.");
}

async function requestJson<T>(
  path: string,
  options: { method?: string; body?: unknown; headers?: HeadersInit } = {},
): Promise<T> {
  if (!resolvedBaseUrl) {
    throw new Error("No API base URL configured");
  }

  const response = await fetch(`${resolvedBaseUrl}${path}`, {
    method: options.method ?? (options.body ? "POST" : "GET"),
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function postJson<T>(path: string, body: unknown, headers?: HeadersInit): Promise<T> {
  return requestJson<T>(path, { method: "POST", body, headers });
}

function adminHeaders(adminKey: string): HeadersInit {
  return { "x-admin-key": adminKey };
}

export async function incrementRatingClick(rating: number, tenantSlug: string) {
  await postJson("/incrementRating", { rating, tenantSlug });
}

export async function submitFeedback(payload: FeedbackPayload, tenantSlug: string) {
  await postJson("/submitFeedback", { ...payload, tenantSlug });
}

export async function fetchFeedback(adminKey: string, tenantSlug: string, ratingFilter?: number) {
  const response = await postJson<{ entries: FeedbackEntry[] }>(
    "/getFeedback",
    { rating: ratingFilter, tenantSlug },
    adminHeaders(adminKey),
  );
  return response.entries;
}

export async function listRestaurants(adminKey: string) {
  const response = await requestJson<{ restaurants: Restaurant[] }>(`${apiPrefix}/restaurants`, {
    headers: adminHeaders(adminKey),
  });
  return response.restaurants;
}

export async function createRestaurant(adminKey: string, payload: CreateRestaurantPayload) {
  const response = await requestJson<{ restaurant: Restaurant }>(`${apiPrefix}/restaurants`, {
    method: "POST",
    body: payload,
    headers: adminHeaders(adminKey),
  });
  return response.restaurant;
}

export async function fetchRestaurantBySlug(slug: string) {
  const response = await requestJson<{ restaurant: Restaurant }>(`${apiPrefix}/restaurants/${slug}`);
  return response.restaurant;
}

export async function deleteRestaurant(adminKey: string, slug: string) {
  await requestJson<void>(`${apiPrefix}/restaurants/${slug}`, {
    method: "DELETE",
    headers: adminHeaders(adminKey),
  });
}

export async function loginBusiness(payload: BusinessLoginPayload) {
  return postJson<BusinessLoginResponse>(`${apiPrefix}/auth/login`, payload);
}

export async function suggestReply(payload: ReplySuggestionRequest) {
  return postJson<{ reply: string }>(`${apiPrefix}/replies/suggest`, payload);
}
