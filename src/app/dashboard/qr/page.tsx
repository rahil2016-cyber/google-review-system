"use client";

import { buildPublicRatingUrl } from "@/lib/codes";
import QRCode from "qrcode";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

type Restaurant = {
  id: string;
  restaurantName: string;
  uniqueCode: string;
  googleReviewUrl: string;
};

export default function DashboardQrPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => setRestaurants(d.restaurants ?? []));
  }, []);

  const appBase = typeof window !== "undefined" ? window.location.origin : "";

  async function download(url: string, name: string) {
    const dataUrl = await QRCode.toDataURL(url, { width: 600, margin: 2 });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${name}-review-qr.png`;
    a.click();
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-amber-100">Your QR codes</h2>
        <p className="text-sm text-zinc-400">Print and place on tables — customers scan to rate</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {restaurants.map((r) => {
          const url = buildPublicRatingUrl(r.uniqueCode, appBase);
          return (
            <article key={r.id} className="card-surface rounded-2xl border border-amber-200/15 p-6 text-center">
              <h3 className="font-semibold text-amber-100">{r.restaurantName}</h3>
              <div className="mx-auto my-4 inline-flex rounded-2xl bg-white p-4">
                <QRCodeSVG value={url} size={200} level="M" />
              </div>
              <p className="mb-4 break-all text-xs text-zinc-500">{url}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => download(url, r.restaurantName)}
                  className="gold-gradient rounded-xl px-4 py-2 text-sm font-semibold text-zinc-900"
                >
                  Download PNG
                </button>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(url)}
                  className="rounded-xl border border-zinc-600 px-4 py-2 text-sm text-zinc-300"
                >
                  Copy link
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
