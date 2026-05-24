"use client";

import { FeedbackForm } from "@/components/FeedbackForm";
import { StarRating } from "@/components/StarRating";
import { incrementRatingClick, submitFeedback } from "@/lib/api";
import { buildFunnelUrl, buildReviewTemplates } from "@/lib/restaurant";
import { FeedbackPayload } from "@/lib/types";
import { QRCodeSVG } from "qrcode.react";
import { useMemo, useState } from "react";

type FunnelState = "rate" | "feedback" | "thankyou" | "submitted";

export type ReviewFunnelConfig = {
  restaurantName: string;
  googleReviewUrl: string;
  tenantSlug: string;
  appBaseUrl?: string;
};

export function ReviewFunnel({ restaurantName, googleReviewUrl, tenantSlug, appBaseUrl }: ReviewFunnelConfig) {
  const reviewTemplates = useMemo(() => buildReviewTemplates(restaurantName), [restaurantName]);
  const funnelUrl = useMemo(() => buildFunnelUrl(tenantSlug, appBaseUrl), [tenantSlug, appBaseUrl]);

  const [rating, setRating] = useState<number>(0);
  const [state, setState] = useState<FunnelState>("rate");
  const [selectedTemplate, setSelectedTemplate] = useState<string>(reviewTemplates[0]);
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "failed">("idle");

  async function handleRatingSelect(nextRating: number) {
    setRating(nextRating);
    try {
      await incrementRatingClick(nextRating, tenantSlug);
    } catch {
      // Do not block UX if analytics logging fails.
    }
    setState(nextRating <= 3 ? "feedback" : "thankyou");
  }

  async function handleFeedbackSubmit(payload: FeedbackPayload) {
    await submitFeedback(payload, tenantSlug);
    setState("submitted");
  }

  async function copyText(text: string) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // fall through to legacy copy
    }
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.focus();
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }

  async function handlePositiveReview() {
    const copied = await copyText(selectedTemplate);
    setCopyStatus(copied ? "success" : "failed");
    window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8">
      <section className="card-surface w-full rounded-3xl border border-amber-200/20 p-6 shadow-2xl shadow-black/40 backdrop-blur">
        {state === "rate" && (
          <div className="space-y-5 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-amber-100">{restaurantName}</h1>
            <p className="text-zinc-300">How was your experience?</p>
            <StarRating selected={rating} onSelect={handleRatingSelect} />
            <div className="space-y-2 rounded-xl border border-amber-100/10 bg-zinc-900/60 p-3">
              <p className="text-xs text-zinc-400">Scan to share this review page</p>
              <div className="inline-flex rounded-lg bg-white p-2">
                <QRCodeSVG value={funnelUrl} size={90} />
              </div>
            </div>
          </div>
        )}

        {state === "feedback" && <FeedbackForm rating={rating} onSubmit={handleFeedbackSubmit} />}

        {state === "thankyou" && (
          <div className="space-y-5 text-left">
            <p className="text-xl font-medium text-amber-100">We&apos;re glad you loved your experience! 💛</p>
            <p className="text-sm text-zinc-300">Choose a ready review description and post directly on Google:</p>
            <div className="space-y-3">
              {reviewTemplates.map((template) => {
                const active = selectedTemplate === template;
                return (
                  <button
                    key={template}
                    type="button"
                    onClick={() => setSelectedTemplate(template)}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                      active
                        ? "border-amber-300 bg-amber-200/10 text-amber-100"
                        : "border-amber-200/20 bg-zinc-900/70 text-zinc-200 hover:border-amber-200/40"
                    }`}
                  >
                    {template}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handlePositiveReview}
              className="gold-gradient inline-block rounded-xl px-5 py-3 font-semibold text-zinc-900 transition-opacity hover:opacity-90"
            >
              Copy Selected Text & Open Google Review
            </button>
            {copyStatus === "success" && (
              <p className="text-xs text-green-300">Review text copied. Paste it in Google review.</p>
            )}
            {copyStatus === "failed" && (
              <p className="text-xs text-amber-200">Auto-copy failed. Use the box below to copy manually.</p>
            )}
            <div className="space-y-2 rounded-xl border border-amber-100/10 bg-zinc-900/60 p-3">
              <p className="text-xs text-zinc-400">Manual backup copy text</p>
              <textarea
                readOnly
                value={selectedTemplate}
                rows={4}
                className="w-full rounded-lg border border-amber-200/20 bg-zinc-950/80 px-3 py-2 text-xs text-zinc-100 outline-none"
              />
            </div>
            <p className="text-xs text-zinc-400">After Google opens, paste the copied text and submit your review.</p>
            <div className="space-y-2 pt-2">
              <p className="text-sm text-zinc-400">Scan this QR to open the Google review page</p>
              <div className="inline-flex rounded-xl bg-white p-3">
                <QRCodeSVG value={googleReviewUrl} size={120} />
              </div>
            </div>
          </div>
        )}

        {state === "submitted" && (
          <div className="space-y-3 text-center">
            <h2 className="text-xl font-semibold text-amber-100">Thank you for your feedback</h2>
            <p className="text-zinc-300">Our team will review this and get better for your next visit.</p>
          </div>
        )}
      </section>
    </main>
  );
}
