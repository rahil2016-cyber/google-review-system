"use client";

import { StatsCard } from "@/components/ui/StatsCard";
import { RatingChart } from "@/components/ui/RatingChart";
import Link from "next/link";
import { useEffect, useState } from "react";

type Stats = {
  scans: number;
  totalRatings: number;
  averageRating: number;
  lowRatingCount: number;
  highRatingCount: number;
  distribution: { star: number; count: number }[];
  recentFeedback: Array<{
    id: string;
    rating: number;
    customerName: string;
    customerPhone: string | null;
    feedbackMessage: string | null;
    createdAt: string;
    restaurant: { restaurantName: string };
  }>;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => null);
  }, []);

  if (!stats) return <p className="text-zinc-400">Loading dashboard...</p>;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-amber-100">Dashboard</h2>
          <p className="text-sm text-zinc-400">Your private review analytics</p>
        </div>
        <a
          href="/api/dashboard/export"
          className="rounded-xl border border-amber-300/30 px-4 py-2 text-sm text-amber-100 hover:bg-amber-300/10"
        >
          Export CSV
        </a>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="QR scans" value={stats.scans} hint="Customers who opened your link" />
        <StatsCard label="Total ratings" value={stats.totalRatings} />
        <StatsCard label="Average rating" value={stats.averageRating || "—"} />
        <StatsCard label="Low ratings (1–3★)" value={stats.lowRatingCount} hint="Private feedback captured" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RatingChart distribution={stats.distribution} />
        <section className="card-surface rounded-2xl border border-amber-200/15 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-amber-100">Recent negative feedback</h3>
            <Link href="/dashboard/feedback" className="text-xs text-amber-300 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentFeedback.length === 0 ? (
              <p className="text-sm text-zinc-500">No low-rating feedback yet.</p>
            ) : (
              stats.recentFeedback.map((f) => (
                <div key={f.id} className="border-b border-zinc-800 pb-3 text-sm">
                  <div className="flex justify-between">
                    <p className="font-medium text-zinc-200">{f.customerName}</p>
                    <span className="text-amber-200">{f.rating}★</span>
                  </div>
                  <p className="text-xs text-zinc-500">{f.customerPhone}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{f.feedbackMessage}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
