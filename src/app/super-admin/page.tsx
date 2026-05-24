"use client";

import { StatsCard } from "@/components/ui/StatsCard";
import { useEffect, useState } from "react";

type Analytics = {
  totals: {
    clients: number;
    activeClients: number;
    lockedClients: number;
    feedback: number;
    scans: number;
    ratings: number;
  };
  recentFeedback: Array<{
    id: string;
    rating: number;
    customerName: string;
    createdAt: string;
    client: { businessName: string };
    restaurant: { restaurantName: string };
  }>;
};

export default function SuperAdminOverviewPage() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/super-admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => null);
  }, []);

  if (!data) {
    return <p className="text-zinc-400">Loading platform analytics...</p>;
  }

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-amber-100">Platform overview</h2>
        <p className="text-sm text-zinc-400">All businesses and feedback across the platform</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatsCard label="Total clients" value={data.totals.clients} />
        <StatsCard label="Active clients" value={data.totals.activeClients} />
        <StatsCard label="Locked clients" value={data.totals.lockedClients} />
        <StatsCard label="QR scans" value={data.totals.scans} />
        <StatsCard label="Total ratings" value={data.totals.ratings} />
        <StatsCard label="Private feedback" value={data.totals.feedback} />
      </div>

      <section className="card-surface rounded-2xl border border-amber-200/15 p-5">
        <h3 className="mb-4 font-semibold text-amber-100">Recent low-rating feedback</h3>
        <div className="space-y-3">
          {data.recentFeedback.length === 0 ? (
            <p className="text-sm text-zinc-500">No feedback yet.</p>
          ) : (
            data.recentFeedback.map((f) => (
              <div key={f.id} className="flex justify-between border-b border-zinc-800 pb-3 text-sm">
                <div>
                  <p className="text-zinc-200">{f.customerName}</p>
                  <p className="text-xs text-zinc-500">
                    {f.client.businessName} · {f.restaurant.restaurantName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-amber-200">{f.rating}★</p>
                  <p className="text-xs text-zinc-500">{new Date(f.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
