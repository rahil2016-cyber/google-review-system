import { ReviewFunnel } from "@/components/ReviewFunnel";
import { fetchRestaurantBySlug } from "@/lib/api";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

type FunnelSlugPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function FunnelSlugPage({ params }: FunnelSlugPageProps) {
  const { slug } = await params;

  let restaurant;
  try {
    restaurant = await fetchRestaurantBySlug(slug);
  } catch {
    notFound();
  }

  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL;

  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-300">Loading...</div>}>
      <ReviewFunnel
        restaurantName={restaurant.name}
        googleReviewUrl={restaurant.googleReviewUrl}
        tenantSlug={restaurant.slug}
        appBaseUrl={appBaseUrl}
      />
    </Suspense>
  );
}
