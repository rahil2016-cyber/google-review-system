import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  googleReviewUrl: string;
  createdAt: string;
};

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../data");
const dataFile = path.join(dataDir, "restaurants.json");

async function ensureDataFile(): Promise<Restaurant[]> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    const raw = await fs.readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw) as Restaurant[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    const seed: Restaurant[] = [
      {
        id: randomUUID(),
        slug: "sarovar-royalee",
        name: "Sarovar Royalee",
        googleReviewUrl:
          "https://search.google.com/local/writereview?placeid=ChIJ99ara24lujsRDWlTUaI-h9A",
        createdAt: new Date().toISOString(),
      },
    ];
    await fs.writeFile(dataFile, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
}

async function writeAll(restaurants: Restaurant[]): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(restaurants, null, 2), "utf8");
}

export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function listRestaurants(): Promise<Restaurant[]> {
  const restaurants = await ensureDataFile();
  return restaurants.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const restaurants = await ensureDataFile();
  return restaurants.find((r) => r.slug === slug) ?? null;
}

export async function createRestaurant(input: {
  name: string;
  googleReviewUrl: string;
  slug?: string;
}): Promise<Restaurant> {
  const restaurants = await ensureDataFile();
  const baseSlug = slugifyName(input.slug?.trim() || input.name);
  if (!baseSlug) {
    throw new Error("INVALID_SLUG");
  }

  let slug = baseSlug;
  let suffix = 2;
  while (restaurants.some((r) => r.slug === slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const restaurant: Restaurant = {
    id: randomUUID(),
    slug,
    name: input.name.trim(),
    googleReviewUrl: input.googleReviewUrl.trim(),
    createdAt: new Date().toISOString(),
  };

  restaurants.push(restaurant);
  await writeAll(restaurants);
  return restaurant;
}

export async function deleteRestaurant(slug: string): Promise<boolean> {
  const restaurants = await ensureDataFile();
  const next = restaurants.filter((r) => r.slug !== slug);
  if (next.length === restaurants.length) return false;
  await writeAll(next);
  return true;
}
