"use client";

import { StarRating } from "@/components/StarRating";
import { LOW_RATING_REASONS } from "@/lib/constants";
import { buildReviewTemplates } from "@/lib/restaurant";
import { QRCodeSVG } from "qrcode.react";
import { FormEvent, useEffect, useState, useMemo } from "react";

type RestaurantInfo = {
  id: string;
  name: string;
  googleReviewUrl: string;
  uniqueCode: string;
  businessName: string;
};

type PublicRatingFlowProps = {
  uniqueCode: string;
};

type Step = "rate" | "feedback" | "thankyou" | "done";

export function PublicRatingFlow({ uniqueCode }: PublicRatingFlowProps) {
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [step, setStep] = useState<Step>("rate");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState(LOW_RATING_REASONS[0]);
  const [message, setMessage] = useState("");

  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "failed">("idle");

  const reviewTemplates = useMemo(() => {
    if (!restaurant) return [];
    return buildReviewTemplates(restaurant.name);
  }, [restaurant]);

  useEffect(() => {
    if (reviewTemplates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(reviewTemplates[0]);
    }
  }, [reviewTemplates, selectedTemplate]);

  useEffect(() => {
    fetch(`/api/public/restaurant/${uniqueCode}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("not found");
        const data = await res.json();
        setRestaurant(data.restaurant);
      })
      .catch(() => setError("This review link is invalid or the business is inactive."))
      .finally(() => setLoading(false));
  }, [uniqueCode]);

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
    if (!restaurant) return;
    const copied = await copyText(selectedTemplate);
    setCopyStatus(copied ? "success" : "failed");
    setTimeout(() => {
      window.location.href = restaurant.googleReviewUrl;
    }, 1000);
  }

  async function handleRatingSelect(value: number) {
    setRating(value);
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/public/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uniqueCode, rating: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");

      if (data.redirectToGoogle && data.googleReviewUrl) {
        setStep("thankyou");
        return;
      }

      setStep("feedback");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFeedbackSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/public/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uniqueCode,
          rating,
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          feedbackMessage: `${reason}: ${message}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setStep("done");
    } catch {
      setError("Could not submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-400 animate-pulse">
        Loading...
      </div>
    );
  }

  if (error && !restaurant) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <p className="card-surface w-full rounded-2xl border border-red-400/30 p-6 text-center text-red-200">
          {error}
        </p>
      </main>
    );
  }

  if (!restaurant) return null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8">
      <section className="card-surface w-full animate-fade-in rounded-3xl border border-amber-200/20 p-6 shadow-2xl">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-widest text-amber-400/70">Rate your experience</p>
          <h1 className="mt-1 text-2xl font-bold text-amber-100">{restaurant.name}</h1>
          <p className="text-sm text-zinc-400">{restaurant.businessName}</p>
        </div>

        {error && <p className="mb-4 text-center text-sm text-red-300">{error}</p>}

        {step === "rate" && (
          <div className="space-y-6 text-center">
            <p className="text-zinc-300">How was your visit today?</p>
            <StarRating selected={rating} onSelect={handleRatingSelect} disabled={submitting} />
            {submitting && <p className="text-xs text-zinc-500">Processing...</p>}
          </div>
        )}

        {step === "thankyou" && (
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
                <QRCodeSVG value={restaurant.googleReviewUrl} size={120} />
              </div>
            </div>
          </div>
        )}

        {step === "feedback" && (
          <form className="space-y-4" onSubmit={handleFeedbackSubmit}>
            <p className="text-sm text-zinc-300">
              We&apos;re sorry your experience wasn&apos;t perfect. Please tell us how we can improve (private — not posted on Google).
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="input-field"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              required
              className="input-field"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (optional)"
              type="email"
              className="input-field"
            />
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as typeof reason)}
              className="input-field"
            >
              {LOW_RATING_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what went wrong..."
              required
              rows={4}
              className="input-field resize-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="gold-gradient w-full rounded-xl py-3 font-semibold text-zinc-900 disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Submit private feedback"}
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="space-y-3 text-center">
            <p className="text-xl font-semibold text-amber-100">Thank you</p>
            <p className="text-sm text-zinc-400">
              Your feedback was received privately. Our team will contact you soon.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
