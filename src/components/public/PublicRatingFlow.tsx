"use client";

import { StarRating } from "@/components/StarRating";
import { LOW_RATING_REASONS } from "@/lib/constants";
import { FormEvent, useEffect, useState } from "react";

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

type Step = "rate" | "feedback" | "redirecting" | "done";

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
        setStep("redirecting");
        window.location.href = data.googleReviewUrl;
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

        {step === "redirecting" && (
          <div className="space-y-3 text-center">
            <p className="text-lg text-amber-100">Thank you! 🎉</p>
            <p className="text-sm text-zinc-400">Redirecting you to Google Reviews...</p>
            <a
              href={restaurant.googleReviewUrl}
              className="gold-gradient inline-block rounded-xl px-5 py-3 text-sm font-semibold text-zinc-900"
            >
              Open Google Review
            </a>
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
