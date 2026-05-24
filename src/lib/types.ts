import { LOW_RATING_REASONS } from "./constants";

export type LowRatingReason = (typeof LOW_RATING_REASONS)[number];

export type FeedbackPayload = {
  rating: number;
  name: string;
  phone: string;
  email?: string;
  reason: LowRatingReason;
  comments: string;
};

export type FeedbackEntry = FeedbackPayload & {
  timestamp: string;
};

export type AdminLoginForm = {
  username: string;
  password: string;
};

export type BusinessLoginPayload = {
  email: string;
  password: string;
  tenantSlug: string;
};

export type BusinessLoginResponse = {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: string;
  tokenType: "Bearer";
  expiresIn: string;
  tenantId: string;
  role: string;
};

export type ReplySuggestionRequest = {
  businessName: string;
  customerName?: string;
  rating: number;
  reason?: string;
  comments?: string;
  tone?: "professional" | "friendly";
};

export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  googleReviewUrl: string;
  createdAt: string;
};

export type CreateRestaurantPayload = {
  name: string;
  googleReviewUrl: string;
  slug?: string;
};
