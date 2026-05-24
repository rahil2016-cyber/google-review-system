"use client";

import { RatingChart } from "@/components/ui/RatingChart";
import { StatsCard } from "@/components/ui/StatsCard";
import { useEffect, useState } from "react";

type Stats = {
  scans: number;
  totalRatings: number;
  averageRating: number;
  lowRatingCount: number;
  highRatingCount: number;
  distribution: { star: number; count: number }[];
};

export default function DashboardAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) return <p className="text-zinc-400">Loading analytics...</p>;

  const positiveRate =
    stats.totalRatings > 0 ? Math.round((stats.highRatingCount / stats.totalRatings) * 100) : 0;

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-amber-100">Analytics</h2>
        <p className="text-sm text-zinc-400">Rating trends and funnel performance</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="QR scans" value={stats.scans} />
        <StatsCard label="Total ratings" value={stats.totalRatings} />
        <StatsCard label="Google redirects (4–5★)" value={stats.highRatingCount} />
        <StatsCard label="Positive rate" value={`${positiveRate}%`} />
      </div>

      <RatingChart distribution={stats.distribution} />
    </div>
  );
}
