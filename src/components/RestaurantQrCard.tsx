"use client";

import { buildFunnelUrl } from "@/lib/restaurant";
import { Restaurant } from "@/lib/types";
import QRCode from "qrcode";
import { QRCodeSVG } from "qrcode.react";
import { useMemo, useState } from "react";

type RestaurantQrCardProps = {
  restaurant: Restaurant;
  appBaseUrl: string;
  onDelete?: (slug: string) => void;
};

export function RestaurantQrCard({ restaurant, appBaseUrl, onDelete }: RestaurantQrCardProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "done" | "failed">("idle");
  const funnelUrl = useMemo(() => buildFunnelUrl(restaurant.slug, appBaseUrl), [restaurant.slug, appBaseUrl]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(funnelUrl);
      setCopyStatus("done");
    } catch {
      setCopyStatus("failed");
    }
  }

  async function downloadQr() {
    const dataUrl = await QRCode.toDataURL(funnelUrl, { width: 512, margin: 2, errorCorrectionLevel: "M" });
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = `${restaurant.slug}-review-qr.png`;
    anchor.click();
  }

  return (
    <article className="rounded-2xl border border-amber-100/20 bg-zinc-900/60 p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-amber-100">{restaurant.name}</h3>
          <p className="text-xs text-zinc-400">/{restaurant.slug}</p>
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(restaurant.slug)}
            className="rounded-lg border border-red-400/30 px-2 py-1 text-xs text-red-200 hover:bg-red-500/10"
          >
            Delete
          </button>
        )}
      </div>

      <div className="mb-4 inline-flex rounded-xl bg-white p-3">
        <QRCodeSVG value={funnelUrl} size={160} level="M" />
      </div>

      <p className="mb-3 break-all text-xs text-zinc-400">{funnelUrl}</p>

      <div className="flex flex-wrap gap-2">
        <a
          href={funnelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-amber-300/40 px-3 py-1.5 text-xs text-amber-100 hover:bg-amber-300/10"
        >
          Open funnel
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700/30"
        >
          Copy link
        </button>
        <button
          type="button"
          onClick={downloadQr}
          className="gold-gradient rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-900"
        >
          Download QR
        </button>
      </div>

      {copyStatus === "done" && <p className="mt-2 text-xs text-green-300">Link copied.</p>}
      {copyStatus === "failed" && <p className="mt-2 text-xs text-amber-200">Copy failed — select the URL above.</p>}
    </article>
  );
}
