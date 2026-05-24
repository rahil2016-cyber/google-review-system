"use client";

import { useEffect, useState } from "react";

type Feedback = {
  id: string;
  rating: number;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  feedbackMessage: string | null;
  createdAt: string;
  restaurant: { restaurantName: string };
};

export default function DashboardFeedbackPage() {
  const [rows, setRows] = useState<Feedback[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const url = filter ? `/api/dashboard/feedback?rating=${filter}` : "/api/dashboard/feedback";
    fetch(url)
      .then((r) => r.json())
      .then((d) => setRows(d.feedback ?? []));
  }, [filter]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-amber-100">Customer feedback</h2>
          <p className="text-sm text-zinc-400">Private 1–3 star reviews — contact unhappy customers</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="">All ratings</option>
          <option value="1">1 star</option>
          <option value="2">2 stars</option>
          <option value="3">3 stars</option>
        </select>
      </header>

      <div className="card-surface overflow-x-auto rounded-2xl border border-amber-200/15">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-amber-100/10 text-left text-amber-100">
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  No feedback found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-zinc-800/80">
                  <td className="px-4 py-3 text-amber-200">{row.rating}★</td>
                  <td className="px-4 py-3">{row.customerName}</td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {row.customerPhone}
                    {row.customerEmail && <br />}
                    {row.customerEmail}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3">{row.feedbackMessage}</td>
                  <td className="px-4 py-3 text-zinc-400">{row.restaurant.restaurantName}</td>
                  <td className="px-4 py-3 text-zinc-500">{new Date(row.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {row.customerPhone && (
                      <a
                        href={`https://wa.me/${row.customerPhone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-400 hover:underline"
                      >
                        WhatsApp
                      </a>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
