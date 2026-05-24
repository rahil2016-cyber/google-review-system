export type FeedbackEntry = {
  tenantSlug: string;
  rating: number;
  name: string;
  phone: string;
  email?: string;
  reason: string;
  comments: string;
  timestamp: string;
};

const feedbackEntries: FeedbackEntry[] = [];
const ratingClicks: Record<string, Record<number, number>> = {};

export function addRatingClick(tenantSlug: string, rating: number): void {
  if (!ratingClicks[tenantSlug]) ratingClicks[tenantSlug] = {};
  ratingClicks[tenantSlug][rating] = (ratingClicks[tenantSlug][rating] ?? 0) + 1;
}

export function getRatingClicks(tenantSlug?: string) {
  if (tenantSlug) return ratingClicks[tenantSlug] ?? {};
  return ratingClicks;
}

export function addFeedback(
  tenantSlug: string,
  entry: Omit<FeedbackEntry, "timestamp" | "tenantSlug">,
): FeedbackEntry {
  const created = { ...entry, tenantSlug, timestamp: new Date().toISOString() };
  feedbackEntries.unshift(created);
  return created;
}

export function listFeedback(tenantSlug: string, rating?: number): FeedbackEntry[] {
  const scoped = feedbackEntries.filter((entry) => entry.tenantSlug === tenantSlug);
  if (typeof rating === "number") {
    return scoped.filter((entry) => entry.rating === rating);
  }
  return scoped.filter((entry) => entry.rating <= 3);
}
